import uuid

from features.todo.entities.todo_item import TodoItem


def test_todo_item_init():
    id = str(uuid.uuid4())
    todo = TodoItem(id=id, title="title 1", is_completed=False, user_id="xyz")
    assert todo.id == id
    assert todo.title == "title 1"
    assert not todo.is_completed


def test_todo_item_from_dict():
    id = str(uuid.uuid4())
    init_dict = {"id": id, "title": "title 1", "is_completed": False, "user_id": "xyz"}
    todo = TodoItem.from_dict(init_dict)

    assert todo.id == id
    assert todo.title == "title 1"
    assert not todo.is_completed


def test_todo_item_comparison():
    id = str(uuid.uuid4())
    init_dict = {"id": id, "title": "title 1", "is_completed": False, "user_id": "xyz"}
    todo1 = TodoItem.from_dict(init_dict)
    todo2 = TodoItem.from_dict(init_dict)

    assert todo1 == todo2
