# Adding entities

Entities form the domain model of the application.

An entity can be an object with methods, or it can be a set of data structures and functions. It should be a regular class, a dataclass, or a value object (if all the properties are the same, two objects are identical). Entities hold data (state) and logic reusable for various applications.  

```mdx-code-block
import CodeBlock from '@theme/CodeBlock';
import TodoItem from '!!raw-loader!@site/../api/src/entities/TodoItem.py';

<CodeBlock language="jsx">{TodoItem}</CodeBlock>
```

:::info
Entities must not depend on anything, except possibly other entities. 

Entities should be the most stable code within your application. 

Entities should not be affected by any change external to them.
:::