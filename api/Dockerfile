FROM python:3.10-slim as base
WORKDIR /code
ENTRYPOINT ["/code/init.sh"]
CMD ["api"]
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
COPY .flake8 ./
COPY src .
USER 1000

FROM base as prod
RUN poetry install --no-dev
COPY src .
USER 1000
