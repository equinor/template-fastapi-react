from pydantic import BaseModel, Field

from features.todo.interfaces import TodoRepositoryInterface
from infrastructure.repositories.TodoRepository import TodoRepository


class DeleteTodoByIdResponse(BaseModel):
    success: bool = Field(...)


def delete_todo_use_case(
    id: str, todo_item_repository: TodoRepositoryInterface = TodoRepository()
) -> DeleteTodoByIdResponse:
    if todo_item_repository.delete_by_id(id):
        return DeleteTodoByIdResponse(success=True)
    return DeleteTodoByIdResponse(success=False)
