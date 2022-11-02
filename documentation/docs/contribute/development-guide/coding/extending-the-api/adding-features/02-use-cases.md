# Use cases

Use cases implement and encapsulate all the application business rules. 

If the use case wants to access a database (infrastructure layer), then the use case will use a data provider interface. The `add_todo_use_case` interacts with the infrastructure layer via `TodoRepositoryInterface`.

```mdx-code-block
import CodeBlock from '@theme/CodeBlock';

import UseCase from '!!raw-loader!@site/../api/src/features/todo/use_cases/add_todo.py';

<CodeBlock language="jsx">{UseCase}</CodeBlock>
```

* `Required`
  * Each use case needs to have its own read and write model to handle custom requests inputs and outputs for each use case.
* `Optional`
  * A [repository interface](../adding-data-providers/02-repository-interfaces.md) describing necessary repository methods.
    * The use case uses [repositories](../adding-data-providers/03-repositories.md) for reading and writing to external systems like databases.
  
:::info
Changes to use cases should not impact the entities.

The use-case should only know of the repository interface (abstract class) before run-time. The concrete implementation of a repository is injected (dependency injection) into the use-case at run-time. 

:::

## Testing use cases

Use the `todo_repository` fixture as input to use_cases. 

```mdx-code-block
import Test from '!!raw-loader!@site/../api/src/tests/unit/features/todo/use_cases/test_add_todo.py';

<CodeBlock language="jsx">{Test}</CodeBlock>
```
