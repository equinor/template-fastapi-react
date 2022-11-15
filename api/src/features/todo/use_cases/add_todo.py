import uuid

from common.entity_mapper import filter_fields
from data_providers.repository_interfaces.TodoRepositoryInterface import (
    TodoRepositoryInterface,
)
from entities.TodoItem import TodoItem
from features.todo.shared_models import TodoItemResponseModel


# An alternative solution is to use Pydantic BaseModel
# and to duplicate the title and is_completed fields
@filter_fields(name="AddTodo")
class AddTodoRequestModel(TodoItem):
    class Config:
        include = ["title"]


def add_todo_use_case(
    data: AddTodoRequestModel, user_id: str, todo_repository: TodoRepositoryInterface
) -> TodoItemResponseModel:
    todo_item = TodoItem(id=str(uuid.uuid4()), title=data.title, user_id=user_id)
    todo_repository.create(todo_item)
    return TodoItemResponseModel.parse_obj(todo_item)
