#!/usr/bin/env bash
# Provision the two Entra ID app registrations (API + oauth2-proxy) for one
# environment, then mint a client secret for the BFF registration and write
# it to secrets/OAUTH2_CLIENT_SECRET.txt.
#
# Any value not provided as an environment variable will be prompted for.
#
# Inputs (env or interactive):
#   APPLICATION_NAME                Lowercase application slug.
#   ENVIRONMENT                     dev | test | prod
#   OWNERS_GROUP                    Entra ID group whose members own the App
#                                   Registrations (e.g. 'Team Hermes Radix Admin').
#   SERVICE_MANAGEMENT_REFERENCE    Optional ServiceNow CI / Business
#                                   Application ID (Equinor IAM compliance).
#
# Optional (env only):
#   SUBSCRIPTION                    Subscription name or ID (else the current).
#   LOCATION                        Azure region (default: norwayeast).
#   PRODUCTION_HOSTNAMES            Space-separated extra prod hostnames.
#   SECRET_OUT_FILE                 Where to write the client secret
#                                   (default: ../secrets/OAUTH2_CLIENT_SECRET.txt).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCATION="${LOCATION:-norwayeast}"
SECRET_OUT_FILE="${SECRET_OUT_FILE:-$ROOT_DIR/../secrets/OAUTH2_CLIENT_SECRET.txt}"

# Default APPLICATION_NAME to the GitHub repository name (lowercased), derived
# from the `origin` remote URL. Falls back to the repo directory name.
default_application_name() {
    local url
    if url=$(git -C "$ROOT_DIR" config --get remote.origin.url 2>/dev/null) && [[ -n "$url" ]]; then
        local name="${url##*/}"
        name="${name%.git}"
        printf '%s' "${name,,}"
        return
    fi
    local repo_root
    if repo_root=$(git -C "$ROOT_DIR" rev-parse --show-toplevel 2>/dev/null); then
        printf '%s' "$(basename "${repo_root,,}")"
    fi
}

# Prompt for $1 if it is unset/empty. $2 is the prompt label,
# $3 (optional) is a default value shown in brackets.
prompt_for() {
    local var_name="$1" label="$2" default="${3:-}"
    if [[ -n "${!var_name:-}" ]]; then
        return
    fi
    if [[ ! -t 0 ]]; then
        echo "ERROR: '$var_name' is not set and stdin is not a TTY." >&2
        exit 1
    fi
    local prompt="$label"
    [[ -n "$default" ]] && prompt+=" [$default]"
    prompt+=": "
    local value=""
    while [[ -z "$value" ]]; do
        read -r -p "$prompt" value
        if [[ -z "$value" && -n "$default" ]]; then
            value="$default"
        fi
        if [[ -z "$value" ]]; then
            echo "  '$var_name' is required." >&2
        fi
    done
    printf -v "$var_name" '%s' "$value"
}

prompt_optional() {
    local var_name="$1" label="$2"
    if [[ -n "${!var_name:-}" ]]; then
        return
    fi
    if [[ ! -t 0 ]]; then
        return
    fi
    local value
    read -r -p "$label (optional, press Enter to skip): " value
    printf -v "$var_name" '%s' "$value"
}

prompt_for       APPLICATION_NAME "Application slug (lowercase)" "$(default_application_name)"
prompt_for       ENVIRONMENT      "Environment (dev|test|prod)" "dev"
prompt_for       OWNERS_GROUP     "Entra ID owners group name"  "Team Hermes Radix Admin"
prompt_optional  SERVICE_MANAGEMENT_REFERENCE "ServiceNow CI / Business Application ID"

case "$ENVIRONMENT" in
    dev|test|prod) ;;
    *) echo "ERROR: ENVIRONMENT must be one of dev|test|prod (got '$ENVIRONMENT')." >&2; exit 1 ;;
esac

if ! az account show >/dev/null 2>&1; then
    echo "Not logged in to Azure. Running 'az login'..."
    az login >/dev/null
fi

# Verify the 'Application Developer' directory role is active for the
# signed-in user. Without it, the deployment fails with a generic
# 'Forbidden' error from Microsoft Graph. PIM-eligible-but-not-activated
# roles do not appear in memberOf, so this catches the common case where
# the user forgot to activate it.
active_roles=$(
    az rest --method GET \
        --url 'https://graph.microsoft.com/v1.0/me/memberOf' \
        --query "value[?\"@odata.type\"=='#microsoft.graph.directoryRole'].displayName" \
        -o tsv 2>/dev/null || true
)
if ! grep -qFx 'Application Developer' <<<"$active_roles"; then
    cat >&2 <<EOF
ERROR: 'Application Developer' role is not active for the signed-in user.
Activate it in Privileged Identity Management (PIM) and re-run.

Currently active directory roles:
$(sed 's/^/  - /' <<<"${active_roles:-(none)}")
EOF
    exit 1
fi

echo "Resolving owners from group '$OWNERS_GROUP'"
OWNER_OBJECT_IDS=$(
    az ad group member list --group "$OWNERS_GROUP" --query '[].id' -o tsv | tr '\n' ' '
)
if [[ -z "${OWNER_OBJECT_IDS// }" ]]; then
    echo "ERROR: group '$OWNERS_GROUP' has no members or could not be resolved." >&2
    exit 1
fi

# Always include the signed-in user as an owner. The Bicep replaces the owners
# list, so without this the deploying user loses ownership of the app it just
# created — and Application Developer requires you to own an app to create its
# servicePrincipal (next deployment step).
signed_in_user_id=$(az ad signed-in-user show --query id -o tsv)
if ! grep -qw "$signed_in_user_id" <<<"$OWNER_OBJECT_IDS"; then
    OWNER_OBJECT_IDS="$signed_in_user_id $OWNER_OBJECT_IDS"
fi

owners_json=$(printf '%s\n' $OWNER_OBJECT_IDS | jq -R . | jq -s -c .)
prod_hosts_json='[]'
if [[ -n "${PRODUCTION_HOSTNAMES:-}" ]]; then
    prod_hosts_json=$(printf '%s\n' $PRODUCTION_HOSTNAMES | jq -R . | jq -s -c .)
fi

sub_args=()
if [[ -n "${SUBSCRIPTION:-}" ]]; then
    sub_args=(--subscription "$SUBSCRIPTION")
fi

deployment_name="${APPLICATION_NAME}-app-registration-${ENVIRONMENT}"

echo "Deploying app registrations for $APPLICATION_NAME ($ENVIRONMENT)"
outputs_json=$(
    az deployment sub create \
        "${sub_args[@]}" \
        --name "$deployment_name" \
        --location "$LOCATION" \
        --template-file "$ROOT_DIR/app-registration.bicep" \
        --parameters \
            "applicationName=$APPLICATION_NAME" \
            "environment=$ENVIRONMENT" \
            "serviceManagementReference=${SERVICE_MANAGEMENT_REFERENCE:-}" \
            "ownerObjectIds=$owners_json" \
            "productionHostnames=$prod_hosts_json" \
        --query 'properties.outputs' \
        --output json
)

api_app_id=$(jq -r '.apiApplicationId.value' <<<"$outputs_json")
api_scope=$(jq -r '.apiScope.value' <<<"$outputs_json")
oauth2_app_id=$(jq -r '.oauth2ApplicationId.value' <<<"$outputs_json")

echo
echo "  apiApplicationId    = $api_app_id"
echo "  apiScope            = $api_scope"
echo "  oauth2ApplicationId = $oauth2_app_id"
echo

mkdir -p "$(dirname "$SECRET_OUT_FILE")"
secret_display_name="oauth2-proxy ($deployment_name)"
existing_hint=$(
    az ad app credential list "${sub_args[@]}" \
        --id "$oauth2_app_id" \
        --query "[?displayName == '$secret_display_name'].hint" -o tsv
)

if [[ -z "$existing_hint" ]]; then
    echo "Creating new client secret for oauth2-proxy ($oauth2_app_id)"
    az ad app credential reset "${sub_args[@]}" \
        --id "$oauth2_app_id" \
        --append \
        --display-name "$secret_display_name" \
        --years 1 \
        --query password -o tsv \
        > "$SECRET_OUT_FILE"
    chmod 600 "$SECRET_OUT_FILE"
    echo "  client secret written to $SECRET_OUT_FILE"
else
    echo "Client secret '$secret_display_name' already exists (hint: $existing_hint*)."
    echo "Re-run with the existing $SECRET_OUT_FILE or delete it in the Entra portal first."
fi
