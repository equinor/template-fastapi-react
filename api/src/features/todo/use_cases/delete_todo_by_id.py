from pydantic import BaseModel, Field

from features.todo.interfaces.TodoRepositoryInterface import TodoRepositoryInterface


class DeleteTodoByIdResponse(BaseModel):
    success: bool = Field(...)


def delete_todo_use_case(id: str, todo_repository: TodoRepositoryInterface) -> DeleteTodoByIdResponse:
    if not todo_repository.get(id):
        return DeleteTodoByIdResponse(success=False)
    todo_repository.delete(id)
    return DeleteTodoByIdResponse(success=True)
