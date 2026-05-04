#!/usr/bin/env sh
set -eu

if [ -n "${REDIS_PASSWORD_FILE:-}" ]; then
    REDIS_PASSWORD="$(cat "$REDIS_PASSWORD_FILE")"
fi

if [ -z "${REDIS_PASSWORD:-}" ]; then
    echo "REDIS_PASSWORD or REDIS_PASSWORD_FILE must be set" >/dev/stderr
    exit 1
fi

exec redis-server --requirepass "$REDIS_PASSWORD" --bind 0.0.0.0
