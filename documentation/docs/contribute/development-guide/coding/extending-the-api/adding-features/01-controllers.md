# Controller

A controller receives a request, then calls a use case, before finally returning a response. 

The TodoController class is located in the adapters layer, and its responsibility is to validate and transform HTTP requests into an understandable format for the use cases (application layer). The format is defined inside the use cases by the request models. The controller takes the user input (the request), converts it into the request object defined by the use case and passes the request objects to the use case, and at the end return the response objects. Here is the code: 


```mdx-code-block
import CodeBlock from '@theme/CodeBlock';

import Controller from '!!raw-loader!@site/../api/src/features/todo/todo_feature.py';

<CodeBlock language="jsx">{Controller}</CodeBlock>
```

* `Required`
  * The controller needs to be decorated with the create_response decorator, which handles exceptions and returns a unified response type.
  * The controller needs to have set the response_model and request_model, that is used to generate API documentation and used for validation.
* `Optional` 
  * Add [repository implementations](../adding-data-providers/03-repositories.md) to handle communication to external services such as databases and inject the repository implementations to the controller endpoint and pass the injected repository implementations to the use case

:::note

FastAPI is built around the [OpenAPI Specification](https://github.com/OAI/OpenAPI-Specification) (formerly known as swagger) standards. In FastAPI, by coding your endpoints, you are automatically writing your API documentation. FastAPI maps your endpoint details to a [JSON Schema](https://json-schema.org/) document.  Under the hood, FastAPI uses Pydantic for data validation. With Pydantic along with [type hints](https://docs.python.org/3/library/typing.html), you get a nice editor experience with autocompletion.

:::

## Testing controllers

Use the `test_client` fixture to populate the database with test data and `test_app` fixture to perform REST API calls. 

```mdx-code-block
import Test from '!!raw-loader!@site/../api/src/tests/integration/features/todo/test_todo_feature.py';

<CodeBlock language="jsx">{Test}</CodeBlock>
```

:::note

Mark it as integration test.

:::