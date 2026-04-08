# Clients

The template already ships with a mongo database client for connecting to MongoDB databases. However, if you need a client that can talk to e.g. PostgreSQL you need to add this.

```python
--8<-- "api/src/app/data_providers/clients/mongodb/mongo_database_client.py"
```

## Testing clients

The `test_client` fixture are using the mongomock instead of real database.

```python
--8<-- "api/tests/unit/data_providers/clients/mongodb/test_mongo_database_client.py"
```
