# Clients

The template already ships with a mongo database client for connecting to MongoDB databases. However, if you need a client that can talk to e.g. PostgreSQL you need to add this.

```mdx-code-block
import CodeBlock from '@theme/CodeBlock';

import MongoClient from '!!raw-loader!@site/../api/src/infrastructure/clients/mongodb/MongoDatabaseClient.py';

<CodeBlock language="jsx">{MongoClient}</CodeBlock>
```

