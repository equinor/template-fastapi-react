import uuid

from pydantic import BaseModel, Field

from features.todo.entities.todo_item import TodoItem
from features.todo.repository.todo_repository_interface import TodoRepositoryInterface


class AddTodoRequest(BaseModel):
    title: str = Field(
        title="The title of the item",
        max_length=300,
        min_length=1,
        example="Read about clean architecture",
    )


class AddTodoResponse(BaseModel):
    id: str = Field(example="vytxeTZskVKR7C7WgdSP3d")
    title: str = Field(example="Read about clean architecture")
    is_completed: bool = False

    @staticmethod
    def from_entity(todo_item: TodoItem) -> "AddTodoResponse":
        return AddTodoResponse(id=todo_item.id, title=todo_item.title, is_completed=todo_item.is_completed)


def add_todo_use_case(
    data: AddTodoRequest,
    user_id: str,
    todo_repository: TodoRepositoryInterface,
) -> AddTodoResponse:
    todo_item = TodoItem(id=str(uuid.uuid4()), title=data.title, user_id=user_id)
    todo_repository.create(todo_item)
    return AddTodoResponse.from_entity(todo_item)
