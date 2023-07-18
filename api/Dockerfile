FROM --platform=linux/amd64 python:3.11-slim as base
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

FROM base as development
RUN poetry install
WORKDIR /code/src
COPY src .
USER 1000

FROM base as prod
RUN poetry install --no-dev
WORKDIR /code/src
COPY src .
USER 1000
