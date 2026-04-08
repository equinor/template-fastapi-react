# Repositories

Concrete implementations of repository interfaces. A repository takes entities and returns entities, while hiding
storage details. It can work against local, remote, data services or third party services.

```python
--8<-- "api/src/app/features/todo/repository/todo_repository.py"
```

## Testing repositories

Use the `test_client` fixture as input to TodoRepository. The `test_client` fixture are using the mongomock instead of
real database.

```python
--8<-- "api/tests/unit/features/todo/repository/test_todo_repository.py"
```
