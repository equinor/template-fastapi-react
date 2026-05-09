#!/usr/bin/env sh
set -eu

# Prefer the file (matches the running server's auth source); fall back to env.
if [ -n "${REDIS_PASSWORD_FILE:-}" ] && [ -r "$REDIS_PASSWORD_FILE" ]; then
    REDISCLI_AUTH="$(cat "$REDIS_PASSWORD_FILE")"
else
    REDISCLI_AUTH="${REDIS_PASSWORD:-}"
fi
export REDISCLI_AUTH

# -t bounds the connect timeout so a hung server isn't reported as healthy.
exec redis-cli -t 2 ping
