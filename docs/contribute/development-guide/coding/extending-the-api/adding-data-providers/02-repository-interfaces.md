# Repository interfaces

A repository interface describes the incoming parameters and the type of the object returned by a repository. The
purpose of these interfaces is to allow use-cases to be implementation-agnostic (and thus not depend on an outer layer).
It also allows for mocking of repositories for testing purposes.

```python
--8<-- "api/src/app/features/todo/repository/todo_repository_interface.py"
```
