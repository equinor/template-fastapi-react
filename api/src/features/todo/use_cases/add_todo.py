import uuid
from typing import Optional

from pydantic import BaseModel, Field

from common.use_case import use_case_responses
from entities.TodoItem import TodoItem
from infrastructure.repositories.TodoRepository import TodoRepository


class AddTodoRequest(BaseModel):
    title: str = Field(
        "title",
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


@use_case_responses
def add_todo_use_case(
    data: AddTodoRequest,
    todo_item_repository=TodoRepository(),
) -> Optional[AddTodoResponse]:
    todo_item = TodoItem(id=str(uuid.uuid4()), title=data.title)
    todo_item_repository.create(todo_item)
    return AddTodoResponse.from_entity(todo_item)
