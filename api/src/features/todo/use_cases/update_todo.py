from pydantic import BaseModel, Field
from starlette.responses import JSONResponse

from common.responses import create_response
from entities.TodoItem import TodoItem
from infrastructure.repositories.TodoRepository import TodoRepository


class UpdateTodoRequest(BaseModel):
    title: str = Field(
        "",
        title="The title of the item",
        max_length=300,
        min_length=1,
    )
    is_completed: bool


class UpdateTodoResponse(BaseModel):
    success: bool = Field(...)


@create_response(JSONResponse)
def update_todo_use_case(
    id: str,
    data: UpdateTodoRequest,
    todo_item_repository=TodoRepository(),
) -> dict:
    todo_item = todo_item_repository.get(id)
    updated_todo_item = TodoItem(id=todo_item.id, title=data.title, is_completed=data.is_completed)
    if todo_item_repository.update(updated_todo_item):
        return UpdateTodoResponse(success=True).dict()
    return UpdateTodoResponse(success=False).dict()
