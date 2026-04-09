from fastapi import APIRouter, Depends

from app.authentication import User, auth_with_jwt
from app.common.exception_handlers import ExceptionHandlingRoute
from app.features.todo.repository import TodoRepositoryInterface, get_todo_repository
from app.features.todo.use_cases import (
    AddTodoRequest,
    AddTodoResponse,
    DeleteTodoByIdResponse,
    GetTodoAllResponse,
    GetTodoByIdResponse,
    UpdateTodoRequest,
    UpdateTodoResponse,
    add_todo_use_case,
    delete_todo_use_case,
    get_todo_all_use_case,
    get_todo_by_id_use_case,
    update_todo_use_case,
)

router = APIRouter(tags=["todo"], prefix="/todos", route_class=ExceptionHandlingRoute)


@router.post("", operation_id="createTodo")
def add_todo(
    data: AddTodoRequest,
    user: User = Depends(auth_with_jwt),
    todo_repository: TodoRepositoryInterface = Depends(get_todo_repository),
) -> AddTodoResponse:
    return add_todo_use_case(data=data, user_id=user.user_id, todo_repository=todo_repository)


@router.get("/{id}", operation_id="getTodoById")
def get_todo_by_id(
    id: str,
    user: User = Depends(auth_with_jwt),
    todo_repository: TodoRepositoryInterface = Depends(get_todo_repository),
) -> GetTodoByIdResponse:
    return get_todo_by_id_use_case(id=id, user_id=user.user_id, todo_repository=todo_repository)


@router.delete("/{id}", operation_id="deleteTodoById")
def delete_todo_by_id(
    id: str,
    user: User = Depends(auth_with_jwt),
    todo_repository: TodoRepositoryInterface = Depends(get_todo_repository),
) -> DeleteTodoByIdResponse:
    return delete_todo_use_case(id=id, user_id=user.user_id, todo_repository=todo_repository)


@router.get("", operation_id="getAllTodos")
def get_todo_all(
    user: User = Depends(auth_with_jwt), todo_repository: TodoRepositoryInterface = Depends(get_todo_repository)
) -> list[GetTodoAllResponse]:
    return get_todo_all_use_case(user_id=user.user_id, todo_repository=todo_repository)  # type: ignore


@router.put("/{id}", operation_id="updateTodoById")
def update_todo(
    id: str,
    data: UpdateTodoRequest,
    user: User = Depends(auth_with_jwt),
    todo_repository: TodoRepositoryInterface = Depends(get_todo_repository),
) -> UpdateTodoResponse:
    return update_todo_use_case(id=id, data=data, user_id=user.user_id, todo_repository=todo_repository)
