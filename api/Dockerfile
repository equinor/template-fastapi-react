FROM --platform=linux/amd64 python:3.11-slim AS base
WORKDIR /code
CMD ["/code/src/init.sh", "api"]
EXPOSE 5000

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/code

COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

COPY pyproject.toml pyproject.toml
COPY uv.lock uv.lock

RUN mkdir -p /.cache/uv && \
    chown -R 1000:1000 /.cache/uv/

FROM base as development
RUN uv sync --frozen --no-cache
WORKDIR /code/src
COPY src .
USER 1000

FROM base as prod
RUN uv sync --frozen --no-cache
WORKDIR /code/src
COPY src .
USER 1000
