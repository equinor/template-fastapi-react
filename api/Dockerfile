# syntax=docker/dockerfile:1
# First, build the application in the `/app` directory
FROM python:3.13.12-slim-trixie AS base
ENV XDG_CACHE_HOME=/var/lib
ENV UV_PROJECT_ENVIRONMENT=/usr/local

WORKDIR /app/src
CMD ["/app/src/init.sh", "api"]
EXPOSE 5000

ENV PYTHONPATH=/app/src

FROM base AS dependencies
COPY --from=docker.io/astral/uv:0.10.7 /uv /uvx /usr/local/bin/
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# Configure the Python directory so it is consistent
ENV UV_PYTHON_INSTALL_DIR=/python

WORKDIR /app
ENV \
    UV_PYTHON_PREFERENCE="only-system" \
    UV_PREFIX="/usr/local/"
RUN --mount=type=cache,target="$XDG_CACHE_HOME/uv" \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --locked --no-install-project --no-default-groups
WORKDIR /app/src

FROM base AS source-code
COPY src .

FROM dependencies AS development
RUN --mount=type=cache,target="$XDG_CACHE_HOME/uv" \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --locked --all-groups --no-install-project
COPY --from=source-code /app /app

FROM base AS prod
ENV SITE_PACKAGES=/usr/local/lib/python3.13/site-packages
COPY --from=dependencies $SITE_PACKAGES $SITE_PACKAGES
COPY --from=source-code /app /app
