# syntax=docker/dockerfile:1
FROM python:3.13.2-alpine3.21 AS base
ENV XDG_CACHE_HOME=/var/lib/
ENV SITE_PACKAGES=/usr/local/lib/python3.13/site-packages

ENV USER="api-user"

RUN adduser \
    --disabled-password \
    --home /code \
    --gecos "" \
    --uid 1000 \
    "$USER"

WORKDIR /code
CMD ["/code/src/init.sh", "api"]
EXPOSE 5000

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/code/src

FROM base AS dependencies
ENV POETRY_VERSION=1.8.5

ENV TO_BE_REMOVED="/usr/local/share/to-be-removed.txt"
# Enumerate files that should not be present in dependencies-slim
# that way, the relevant folders can be COPY-ed without incurring the size cost of already existing items
RUN <<EOF
#!/usr/bin/env sh
set -eu

find /usr/local/bin -mindepth 1 > "$TO_BE_REMOVED"
find "$SITE_PACKAGES" -maxdepth 1 -mindepth 1 >> "$TO_BE_REMOVED"

EOF

ENV PATH="/root/.local/bin:$PATH"
RUN \
    --mount=type=cache,target="$XDG_CACHE_HOME/pip" \
    pip install --upgrade pip && \
    pip install --user "poetry==$POETRY_VERSION" && \
    poetry config virtualenvs.create false

RUN --mount=type=cache,target=/var/cache/apk \
    apk add  \
        linux-headers \
        musl-dev \
        gcc

COPY --chown="$USER:$USER" \
    pyproject.toml poetry.lock ./
RUN --mount=type=cache,target="$XDG_CACHE_HOME/pip" \
    poetry install --no-dev

FROM dependencies AS dependencies-slim
RUN <<EOF
#!/usr/bin/env sh
set -eu

# Remove all files / directories that are (already) present in the final image
cat "$TO_BE_REMOVED" | while IFS= read -r path; do
    rm -rf "$path"
done
EOF

FROM dependencies AS development
RUN --mount=type=cache,target="$XDG_CACHE_HOME/pip" \
    poetry install --with dev
COPY --chown="$USER:$USER" . .
USER 1000

FROM base AS prod
COPY --from=dependencies-slim "$SITE_PACKAGES" "$SITE_PACKAGES"
COPY --from=dependencies-slim /usr/local/bin/ /usr/local/bin/
COPY --chown="$USER:$USER" src src
USER 1000
