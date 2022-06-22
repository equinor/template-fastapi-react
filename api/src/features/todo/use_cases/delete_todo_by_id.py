from pydantic import BaseModel, Field

from common.use_case import use_case_responses
from features.todo.interfaces import TodoRepositoryInterface
from infrastructure.repositories.TodoRepository import TodoRepository


class DeleteTodoByIdResponse(BaseModel):
    success: bool = Field(...)


@use_case_responses
def delete_todo_use_case(
    id: str, todo_item_repository=TodoRepository()
) -> DeleteTodoByIdResponse:
    if todo_item_repository.delete_by_id(id):
        return DeleteTodoByIdResponse(success=True)
    return DeleteTodoByIdResponse(success=False)
