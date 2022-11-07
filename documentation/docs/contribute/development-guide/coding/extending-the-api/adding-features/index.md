# Adding features

A feature has this structure.

```
├── todo/
│   ├── use_cases/ - Application logic
│   ├── exceptions.py - Exceptions classes (optional)
│   └── controller.py - The entrypoint
└── ...
```

Define endpoints in the controller that calls use cases that implements the application logic. 

## Register a feature

Import the router of the feature and include it to the app.

```mdx-code-block
import CodeBlock from '@theme/CodeBlock';

import UseCase from '!!raw-loader!@site/../api/src/app.py';

<CodeBlock language="jsx">{UseCase}</CodeBlock>
```


