#!/usr/bin/env bash
# Provision the per-environment Azure resources defined in main.bicep
# (resource group, Postgres, etc.).
#
# Required environment variables:
#   ENVIRONMENT             dev | staging | prod
#   POSTGRES_DB_PASSWORD    Admin password for the Postgres server.
#
# Optional:
#   SUBSCRIPTION            Subscription name or ID (else the current).
#   LOCATION                Azure region (default: norwayeast).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCATION="${LOCATION:-norwayeast}"

require() {
    if [[ -z "${!1:-}" ]]; then
        echo "ERROR: required environment variable '$1' is not set." >&2
        exit 1
    fi
}
require ENVIRONMENT
require POSTGRES_DB_PASSWORD

sub_args=()
if [[ -n "${SUBSCRIPTION:-}" ]]; then
    sub_args=(--subscription "$SUBSCRIPTION")
fi

echo "Deploying Azure resources for $ENVIRONMENT"
az deployment sub create \
    "${sub_args[@]}" \
    --name "template-fastapi-react-${ENVIRONMENT}-resources" \
    --location "$LOCATION" \
    --template-file "$ROOT_DIR/main.bicep" \
    --parameters \
        "environment=$ENVIRONMENT" \
        "resourceGroupLocation=$LOCATION" \
        "postgresDBPassword=$POSTGRES_DB_PASSWORD"
