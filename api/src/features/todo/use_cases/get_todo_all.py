from typing import List

from pydantic import BaseModel, Field
from starlette.responses import JSONResponse

from common.responses import create_response
from entities.TodoItem import TodoItem
from infrastructure.repositories.TodoRepository import TodoRepository


class GetTodoAllResponse(BaseModel):
    id: str = Field(...)
    title: str = Field(...)
    is_completed: bool

    @staticmethod
    def from_entity(todo_item: TodoItem):
        return GetTodoAllResponse(id=todo_item.id, title=todo_item.title, is_completed=todo_item.is_completed)


@create_response(JSONResponse)
def get_todo_all_use_case(
    todo_item_repository=TodoRepository(),
) -> List[dict]:
    response: List[dict] = []
    todo_items: List[TodoItem] = todo_item_repository.get_all()

    for todo_item in todo_items:
        response.append(GetTodoAllResponse.from_entity(todo_item).dict())

    return response
