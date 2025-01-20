FROM --platform=linux/amd64 python:3.13-slim AS base
WORKDIR /code
CMD ["/code/src/init.sh", "api"]
EXPOSE 5000

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/code

RUN pip install --upgrade pip && \
    pip install poetry && \
    poetry config virtualenvs.create false

COPY pyproject.toml pyproject.toml
COPY poetry.lock poetry.lock

FROM base AS development
RUN poetry install
WORKDIR /code/src
COPY src .
USER 1000

FROM base AS prod
RUN poetry install --without dev
WORKDIR /code/src
COPY src .
USER 1000
