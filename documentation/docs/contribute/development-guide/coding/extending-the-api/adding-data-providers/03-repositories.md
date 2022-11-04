# Repositories

Concrete implementations of repository interfaces. A repository takes entities and returns entities, while hiding storage details. It can work against local, remote, data services or third party services.   


```mdx-code-block
import CodeBlock from '@theme/CodeBlock';

import TodoRepository from '!!raw-loader!@site/../api/src/data_providers/repositories/TodoRepository.py';

<CodeBlock language="jsx">{TodoRepository}</CodeBlock>
```

## Testing repositories

Use the `test_client` fixture as input to TodoRepository. The `test_client` fixture are using the mongomock instead of real database. 

```mdx-code-block
import Test from '!!raw-loader!@site/../api/src/tests/unit/data_providers/repositories/test_TodoRepository.py';

<CodeBlock language="jsx">{Test}</CodeBlock>
```