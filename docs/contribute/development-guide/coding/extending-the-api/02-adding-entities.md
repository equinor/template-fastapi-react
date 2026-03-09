# Adding entities

Entities form the domain model of the application.

An entity can be an object with methods, or it can be a set of data structures and functions. It should be a regular
class, a dataclass, or a value object (if all the properties are the same, two objects are identical). Entities hold
data (state) and logic reusable for various applications.

```python
--8<-- "api/src/app/features/todo/entities/todo_item.py"
```

!!! info "Info"
    Entities must not depend on anything, except possibly other entities.

    Entities should be the most stable code within your application.

    Entities should not be affected by any change external to them.

## Testing entities

```python
--8<-- "api/tests/unit/features/todo/entities/test_todo_item.py"
```
