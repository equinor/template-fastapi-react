# Clients

The template already ships with a mongo database client for connecting to MongoDB databases. However, if you need a client that can talk to e.g. PostgreSQL you need to add this.

```mdx-code-block
import CodeBlock from '@theme/CodeBlock';

import MongoClient from '!!raw-loader!@site/../api/src/data_providers/clients/mongodb/mongo_database_client.py';

<CodeBlock language="jsx">{MongoClient}</CodeBlock>
```

## Testing clients

The `test_client` fixture are using the mongomock instead of real database. 

```mdx-code-block
import Test from '!!raw-loader!@site/../api/src/tests/unit/data_providers/clients/mongodb/test_mongo_database_client.py';

<CodeBlock language="jsx">{Test}</CodeBlock>
```