# First, build the application in the `/app` directory
FROM --platform=linux/amd64 ghcr.io/astral-sh/uv:bookworm-slim AS uv-base
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# Configure the Python directory so it is consistent
ENV UV_PYTHON_INSTALL_DIR=/python

# Only use the managed Python version
ENV UV_PYTHON_PREFERENCE=only-managed

RUN uv python install 3.13

FROM uv-base AS base
# Install Python before the project for caching

WORKDIR /app
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --locked --no-install-project --no-dev
COPY . /app

# Place executables in the environment at the front of the path
ENV PATH="/app/.venv/bin:$PATH"
WORKDIR /app/src
EXPOSE 5000
CMD ["/app/src/init.sh", "api"]


FROM base AS development
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --dev

FROM base AS prod
