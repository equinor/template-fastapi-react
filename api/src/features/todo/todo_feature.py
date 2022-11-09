from typing import List

from fastapi import APIRouter, Depends
from starlette.responses import JSONResponse

from authentication.authentication import auth_with_jwt
from authentication.models import User
from common.responses import create_response
from data_providers.get_repository import get_todo_repository
from data_providers.repository_interfaces.TodoRepositoryInterface import (
    TodoRepositoryInterface,
)

from .use_cases.add_todo import AddTodoRequest, AddTodoResponse, add_todo_use_case
from .use_cases.delete_todo_by_id import DeleteTodoByIdResponse, delete_todo_use_case
from .use_cases.get_todo_all import GetTodoAllResponse, get_todo_all_use_case
from .use_cases.get_todo_by_id import GetTodoByIdResponse, get_todo_by_id_use_case
from .use_cases.update_todo import (
    UpdateTodoRequest,
    UpdateTodoResponse,
    update_todo_use_case,
)

router = APIRouter(tags=["todos"], prefix="/todos")


@router.post("", operation_id="create", response_model=AddTodoResponse)
@create_response(JSONResponse)
def add_todo(
    data: AddTodoRequest,
    user: User = Depends(auth_with_jwt),
    todo_repository: TodoRepositoryInterface = Depends(get_todo_repository),
):
    return add_todo_use_case(data=data, user_id=user.user_id, todo_repository=todo_repository).dict()


@router.get("/{id}", operation_id="get_by_id", response_model=GetTodoByIdResponse)
@create_response(JSONResponse)
def get_todo_by_id(
    id: str,
    user: User = Depends(auth_with_jwt),
    todo_repository: TodoRepositoryInterface = Depends(get_todo_repository),
):
    return get_todo_by_id_use_case(id=id, user_id=user.user_id, todo_repository=todo_repository).dict()


@router.delete("/{id}", operation_id="delete_by_id", response_model=DeleteTodoByIdResponse)
@create_response(JSONResponse)
def delete_todo_by_id(id: str, todo_repository: TodoRepositoryInterface = Depends(get_todo_repository)):
    return delete_todo_use_case(id=id, todo_repository=todo_repository).dict()


@router.get("", operation_id="get_all", response_model=List[GetTodoAllResponse])
@create_response(JSONResponse)
def get_todo_all(
    user: User = Depends(auth_with_jwt), todo_repository: TodoRepositoryInterface = Depends(get_todo_repository)
):
    return [todo.dict() for todo in get_todo_all_use_case(user_id=user.user_id, todo_repository=todo_repository)]


@router.put("/{id}", operation_id="update_by_id", response_model=UpdateTodoResponse)
@create_response(JSONResponse)
def update_todo(
    id: str,
    data: UpdateTodoRequest,
    user: User = Depends(auth_with_jwt),
    todo_repository: TodoRepositoryInterface = Depends(get_todo_repository),
):
    return update_todo_use_case(id=id, data=data, user_id=user.user_id, todo_repository=todo_repository).dict()
