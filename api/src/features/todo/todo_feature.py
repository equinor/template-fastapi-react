from fastapi import APIRouter, Depends

from authentication.authentication import auth_with_jwt
from authentication.models import User
from features.todo.repository.todo_repository import get_todo_repository
from features.todo.repository.todo_repository_interface import TodoRepositoryInterface
from features.todo.use_cases.add_todo import (
    AddTodoRequest,
    AddTodoResponse,
    add_todo_use_case,
)
from features.todo.use_cases.delete_todo_by_id import (
    DeleteTodoByIdResponse,
    delete_todo_use_case,
)
from features.todo.use_cases.get_todo_all import get_todo_all_use_case
from features.todo.use_cases.get_todo_by_id import (
    GetTodoByIdResponse,
    get_todo_by_id_use_case,
)
from features.todo.use_cases.update_todo import (
    UpdateTodoRequest,
    UpdateTodoResponse,
    update_todo_use_case,
)

router = APIRouter(tags=["todos"], prefix="/todos")


@router.post("", operation_id="create")
def add_todo(
    data: AddTodoRequest,
    user: User = Depends(auth_with_jwt),
    todo_repository: TodoRepositoryInterface = Depends(get_todo_repository),
) -> AddTodoResponse:
    return add_todo_use_case(data=data, user_id=user.user_id, todo_repository=todo_repository)


@router.get("/{id}", operation_id="get_by_id")
def get_todo_by_id(
    id: str,
    user: User = Depends(auth_with_jwt),
    todo_repository: TodoRepositoryInterface = Depends(get_todo_repository),
) -> GetTodoByIdResponse:
    return get_todo_by_id_use_case(id=id, user_id=user.user_id, todo_repository=todo_repository)


@router.delete("/{id}", operation_id="delete_by_id")
def delete_todo_by_id(
    id: str,
    user: User = Depends(auth_with_jwt),
    todo_repository: TodoRepositoryInterface = Depends(get_todo_repository),
) -> DeleteTodoByIdResponse:
    return delete_todo_use_case(id=id, user_id=user.user_id, todo_repository=todo_repository)


@router.get("", operation_id="get_all")
def get_todo_all(
    user: User = Depends(auth_with_jwt), todo_repository: TodoRepositoryInterface = Depends(get_todo_repository)
):
    return get_todo_all_use_case(user_id=user.user_id, todo_repository=todo_repository)


@router.put("/{id}", operation_id="update_by_id")
def update_todo(
    id: str,
    data: UpdateTodoRequest,
    user: User = Depends(auth_with_jwt),
    todo_repository: TodoRepositoryInterface = Depends(get_todo_repository),
) -> UpdateTodoResponse:
    return update_todo_use_case(id=id, data=data, user_id=user.user_id, todo_repository=todo_repository)
