#!/usr/bin/env bash
set -euo pipefail

readonly DEFAULT_LOCATION="norwayeast"
readonly PLACEHOLDER_VALUE="<REPLACE_ME>"
readonly RBAC_DEPLOY_ACTION="Microsoft.Resources/deployments/write"
readonly REQUIRED_DIR_ROLE="Application Developer"
readonly ARM_API_VERSION="2022-04-01"

# Allow the caller to override the Azure region via the LOCATION env var.
if [[ -z "${LOCATION:-}" ]]; then
    LOCATION="$DEFAULT_LOCATION"
fi

die() {
    printf 'ERROR (%s): %s\n' "${FUNCNAME[1]:-_lib}" "$*" >&2
    exit 1
}
warn() { printf 'WARN  (%s): %s\n' "${FUNCNAME[1]:-_lib}" "$*" >&2; }
info() { printf '[%s] %s\n' "${FUNCNAME[1]:-_lib}" "$*"; }

require_config() {
    local var=$1 val=${!1:-}
    if [[ -z "$val" || "$val" == "$PLACEHOLDER_VALUE" ]]; then
        die "$var is not configured. Edit .mise/config.toml."
    fi
}

ensure_login() {
    require_config AZURE_SUBSCRIPTION
    az account show >/dev/null 2>&1 || az login >/dev/null
    require_subscription
    require_active_subscription_role
}

init_task() {
    export ENVIRONMENT="${1:?environment required (dev|test|prod)}"
    require_environment
    ensure_login
    require_config APPLICATION_NAME
}

require_subscription() {
    local active_id active_name
    active_id=$(az account show --query 'id' -o tsv)
    active_name=$(az account show --query 'name' -o tsv)
    if [[ "$active_name" != "$AZURE_SUBSCRIPTION" && "$active_id" != "$AZURE_SUBSCRIPTION" ]]; then
        warn "active='$active_name' ($active_id), expected='$AZURE_SUBSCRIPTION'"
        die "wrong subscription. Run: az account set --subscription '$AZURE_SUBSCRIPTION'"
    fi
    export AZURE_SUBSCRIPTION_ID="$active_id"
}

require_environment() {
    case "${ENVIRONMENT:-}" in
        dev | test | prod) ;;
        *) die "ENVIRONMENT must be dev|test|prod (got '${ENVIRONMENT:-}')" ;;
    esac
}

require_active_subscription_role() {
    local sub=${AZURE_SUBSCRIPTION_ID:?require_subscription must run first}
    local perms has

    perms=$(az rest --method GET \
        --url "https://management.azure.com/subscriptions/$sub/providers/Microsoft.Authorization/permissions?api-version=$ARM_API_VERSION" \
        2>/dev/null) || perms='{"value":[]}'

    # shellcheck disable=SC2016
    local jq_filter='
        def covers(p; a):
            (p == "*") or (p == a) or
            (p | endswith("/*") and (a | startswith(p[:-1])));
        [ .value[]?
          | select(any(.actions[]?;    covers(.; $action)))
          | select(all(.notActions[]?; covers(.; $action) | not))
        ] | length'
    has=$(jq -r --arg action "$RBAC_DEPLOY_ACTION" "$jq_filter" <<<"$perms")
    if [[ "${has:-0}" -gt 0 ]]; then
        return 0
    fi
    cat >&2 <<EOF
ERROR (require_active_subscription_role): no Owner or Contributor RBAC role is
active on subscription '$AZURE_SUBSCRIPTION'. Activate one via PIM:
  https://portal.azure.com → Privileged Identity Management → My roles →
  Azure resources → Owner or Contributor → Activate (scope: $sub)
then re-run this task.
EOF
    exit 1
}

require_active_app_developer_role() {
    local roles
    roles=$(az rest --method GET \
        --url 'https://graph.microsoft.com/v1.0/me/memberOf' \
        --query "value[?\"@odata.type\"=='#microsoft.graph.directoryRole'].displayName" \
        -o tsv)
    grep -qFx "$REQUIRED_DIR_ROLE" <<<"$roles" || {
        cat >&2 <<EOF
ERROR (require_active_app_developer_role): the '$REQUIRED_DIR_ROLE' Entra ID directory role is
not active. Activate it via PIM (https://portal.azure.com → Privileged
Identity Management → My roles → Microsoft Entra roles → $REQUIRED_DIR_ROLE
→ Activate) and re-run this task.
Active directory roles: ${roles:-(none)}
EOF
        exit 1
    }
}

resolve_owners() {
    local me members count
    me=$(az ad signed-in-user show --query id -o tsv)
    members=$(az ad group member list --group "$APP_OWNERS_GROUP" --query '[].id' -o json)
    count=$(jq 'length' <<<"$members")
    [[ "$count" -gt 0 ]] || die \
        "group '$APP_OWNERS_GROUP' has no members; refusing to register apps with only the signed-in user as owner."
    jq -c --arg me "$me" 'if index($me) then . else [$me] + . end' <<<"$members"
}

deploy_bicep() {
    local kind=$1 name=$2 tmpl=$3 params=$4 mode=${5:-apply}
    case "$mode" in
        --validate)
            az bicep build --file "$tmpl" --stdout >/dev/null
            info "validated $tmpl"
            return
            ;;
        --dry-run)
            az deployment sub what-if --name "$name" --location "$LOCATION" \
                --template-file "$tmpl" --parameters "$params" \
                --exclude-change-types Ignore NoChange \
                --result-format FullResourcePayloads
            return
            ;;
    esac
    case "$kind" in
        stack)
            az stack sub create --name "$name" --location "$LOCATION" \
                --template-file "$tmpl" --parameters "$params" \
                --tags "application=$APPLICATION_NAME" \
                "environment=$ENVIRONMENT" "managedBy=bicep" \
                --action-on-unmanage detachAll \
                --deny-settings-mode denyWriteAndDelete --yes
            ;;
        sub)
            az deployment sub create --name "$name" --location "$LOCATION" \
                --template-file "$tmpl" --parameters "$params"
            ;;
        *) die "unknown kind '$kind' (expected stack|sub)" ;;
    esac
}

create_oauth2_secret() {
    local env=$1 rotate=${2:-} display app_id cred existing out
    display="$APPLICATION_NAME-oauth2-$env"
    app_id=$(az ad app list --display-name "$display" --query '[0].appId' -o tsv)
    [[ -n "$app_id" ]] || die "app '$display' not found."
    cred="oauth2-proxy ($display)"
    existing=$(az ad app credential list --id "$app_id" \
        --query "[?displayName=='$cred'].hint" -o tsv)
    if [[ -n "$existing" && "$rotate" != "--rotate" ]]; then
        info "secret '$cred' exists (hint: ${existing}***). Pass --rotate to generate a new one."
        return 0
    fi
    out="secrets/OAUTH2_CLIENT_SECRET_$env.txt"
    (
        umask 077
        mkdir -p secrets
        az ad app credential reset --id "$app_id" --append \
            --display-name "$cred" --years 1 --query password -o tsv >"$out"
    )
    info "wrote $out"
}
