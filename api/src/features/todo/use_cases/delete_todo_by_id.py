from pydantic import BaseModel, Field
from starlette.responses import JSONResponse

from common.responses import create_response
from infrastructure.repositories.TodoRepository import TodoRepository


class DeleteTodoByIdResponse(BaseModel):
    success: bool = Field(...)


@create_response(JSONResponse)
def delete_todo_use_case(id: str, todo_item_repository=TodoRepository()) -> dict:
    if not todo_item_repository.get(id):
        return DeleteTodoByIdResponse(success=False).dict()
    todo_item_repository.delete_by_id(id)
    return DeleteTodoByIdResponse(success=True).dict()
