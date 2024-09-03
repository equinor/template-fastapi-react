FROM --platform=linux/amd64 python:3.11-slim AS base
WORKDIR /code
CMD ["/code/src/init.sh", "api"]
EXPOSE 5000

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/code
ENV VIRTUAL_ENV=/code/.venv
ENV PATH="/code/.venv/bin:$PATH"

# Install uv: The installer requires curl (and certificates) to download the release archive
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates
ADD https://astral.sh/uv/0.4.3/install.sh /uv-installer.sh
RUN sh /uv-installer.sh && rm /uv-installer.sh
# Ensure the installed binary is on the `PATH`
ENV PATH="/root/.cargo/bin/:$PATH"

COPY pyproject.toml pyproject.toml
COPY uv.lock uv.lock


FROM base as development
RUN uv sync --frozen --no-cache --all-extras
WORKDIR /code/src
COPY src .
USER 1000

FROM base as prod
RUN uv sync --frozen --no-cache
WORKDIR /code/src
COPY src .
USER 1000
