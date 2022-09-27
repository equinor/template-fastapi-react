# OpenAPI (swagger)

## API Documentation

FastAPI is carefully built around the [OpenAPI Specification](https://github.com/OAI/OpenAPI-Specification) (formerly
known as swagger) standards. In FastAPI, by coding your endpoints, you are automatically writing your API documentation.
Under the hood, FastAPI maps your endpoint details to a [JSON Schema](https://json-schema.org/) document.

The generated documentation can (if given enough detail) display:

* Path operations
* Parameters
* Body requests
* Security details such as required headers

## Data Validation

Under the hood, FastAPI uses Pydantic for data validation. With Pydantic along
with [type hints](https://docs.python.org/3/library/typing.html), you get a nice editor experience with autocompletion.
You also get data validation, serialization and deserialization (for building an API), and automatic documentation (via
JSON Schema and OpenAPI).

## OpenAPI generators

To generate typescript client for API run:

```shell
./generate-api-typescript-client.sh
```

This will populate `web/src/api/generated` with new typescript files that matches the API OpenAPI specification.