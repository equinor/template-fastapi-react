# syntax=docker/dockerfile:1
# First, build the application in the `/app` directory
FROM python:3.14.4-slim-trixie AS base
ENV XDG_CACHE_HOME=/var/lib
ENV UV_PROJECT_ENVIRONMENT=/usr/local

WORKDIR /app
CMD ["/app/src/init.sh", "api"]
EXPOSE 5000

ENV PYTHONPATH=/app/src

# Install Equinor's root CA bundle so requests through the corporate
# TLS-inspecting proxy (e.g. local dev behind Zscaler) succeed. The
# script is a no-op on networks where the corporate root isn't presented
# in the chain, so it's safe to keep enabled in CI/Radix.
RUN --mount=type=bind,source=bin/install-equinor-certificates.sh,target=/tmp/install-equinor-certificates.sh \
    /tmp/install-equinor-certificates.sh debian

FROM base AS dependencies
COPY --from=docker.io/astral/uv:0.11.6 /uv /uvx /usr/local/bin/
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# Configure the Python directory so it is consistent
ENV UV_PYTHON_INSTALL_DIR=/python

ENV \
    UV_PYTHON_PREFERENCE="only-system" \
    UV_PREFIX="/usr/local/"
RUN --mount=type=cache,target="$XDG_CACHE_HOME/uv" \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --locked --no-install-project --no-default-groups

FROM base AS source-code
COPY src src

FROM dependencies AS development
RUN --mount=type=cache,target="$XDG_CACHE_HOME/uv" \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --locked --all-groups --no-install-project
COPY --from=source-code /app ./
COPY tests tests

FROM base AS prod
ENV SITE_PACKAGES=/usr/local/lib/python3.14/site-packages
COPY --from=dependencies $SITE_PACKAGES $SITE_PACKAGES
COPY --from=source-code /app /app
