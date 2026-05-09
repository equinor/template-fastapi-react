#!/usr/bin/env sh
set -eu

if [ "${TRACE:-}" = "1" ]; then
    set -x
fi

if [ -z "${REDIS_PASSWORD:-}" ]; then
    if [ -z "${REDIS_PASSWORD_FILE:-}" ]; then
        echo "REDIS_PASSWORD or REDIS_PASSWORD_FILE must be set" >&2
        exit 1
    fi
    REDIS_PASSWORD="$(cat "$REDIS_PASSWORD_FILE")"
    export REDIS_PASSWORD
fi

# If the first arg looks like a command (not a flag), exec it directly —
# lets you `docker run … sh` for debugging.
if [ -n "${1:-}" ] && [ "${1#-}" = "$1" ]; then
    exec "$@"
fi

# --save "" disables RDB snapshotting: sessions are ephemeral, so the
# default snapshot policy only writes useless data to the volume.
# Extra args from CMD flow through to redis-server.
exec redis-server --requirepass "$REDIS_PASSWORD" --bind 0.0.0.0 --save "" "$@"
