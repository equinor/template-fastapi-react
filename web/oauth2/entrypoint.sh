#!/usr/bin/env sh
set -eu

if [ "${TRACE:-}" = "1" ]; then
    set -x
fi

if [ "${1:-}" = "sh" ]; then
    exec "$@"
    exit $?
fi

abort() {
    echo "$1" >/dev/stderr
    exit 1
}

if [ -z "${OAUTH2_PROXY_REDIRECT_URL:-}" ]; then
    abort "OAUTH2_PROXY_REDIRECT_URL must be set"
fi

# oauth2-proxy does not natively support reading the redis password from a file.
if [ -z "${OAUTH2_PROXY_REDIS_PASSWORD:-}" ]; then
    if [ -z "${OAUTH2_PROXY_REDIS_PASSWORD_FILE:-}" ] && ! echo "$*" | grep -qE -- '--redis-password( +|=)?'; then
        abort "Redis password is not set"
    elif [ -n "${OAUTH2_PROXY_REDIS_PASSWORD_FILE:-}" ]; then
        set -- \
            "$@" \
            --redis-password \
            "$(cat "$OAUTH2_PROXY_REDIS_PASSWORD_FILE")"
    fi
else
    set -- \
        "$@" \
        --redis-password \
        "$OAUTH2_PROXY_REDIS_PASSWORD"
fi

if [ -z "${CLIENT_SECRET:-}" ] && [ -z "${CLIENT_SECRET_FILE:-}" ]; then
    abort "CLIENT_SECRET or CLIENT_SECRET_FILE must be set"
fi

generate_secret() {
    bits="${1:-32}"
    dd if=/dev/urandom bs="$bits" count=1 2>/dev/null | base64 | tr -d -- '\n' | tr -- '+/' '-_'
    echo
}

main() {
    if ! echo "$*" | grep -qE -- '--cookie-secret( +|=)?'; then
        if [ -n "${OAUTH2_PROXY_COOKIE_SECRET:-}" ]; then
            set -- "$@" --cookie-secret "$OAUTH2_PROXY_COOKIE_SECRET"
        elif [ -n "${OAUTH2_PROXY_COOKIE_SECRET_FILE:-}" ]; then
            set -- "$@" --cookie-secret "$(cat "$OAUTH2_PROXY_COOKIE_SECRET_FILE")"
        else
            set -- "$@" --cookie-secret "$(generate_secret 32)"
        fi
    fi
    exec /usr/local/bin/oauth2-proxy "$@"
}

main "$@"
