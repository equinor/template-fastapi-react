# Repository interfaces

A repository interface describes the incoming parameters and the type of the object returned by a repository. The
purpose of these interfaces is to allow use-cases to be implementation-agnostic (and thus not depend on an outer layer).
It also allows for mocking of repositories for testing purposes.

```mdx-code-block
import CodeBlock from '@theme/CodeBlock';

import TodoRepositoryInterface from '!!raw-loader!@site/../api/src/features/todo/repository/todo_repository_interface.py';

<CodeBlock language="jsx">{TodoRepositoryInterface}</CodeBlock>
```

