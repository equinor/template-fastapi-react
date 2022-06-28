from typing import List

from fastapi import APIRouter

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
def add_todo(data: AddTodoRequest):
    return add_todo_use_case(data)


@router.get("/{id}", operation_id="get_by_id", response_model=GetTodoByIdResponse)
def get_todo_by_id(id: str):
    return get_todo_by_id_use_case(id)


@router.delete("/{id}", operation_id="delete_by_id", response_model=DeleteTodoByIdResponse)
def delete_todo_by_id(id: str):
    return delete_todo_use_case(id)


@router.get("", operation_id="get_all", response_model=List[GetTodoAllResponse])
def get_todo_all():
    return get_todo_all_use_case()


@router.put("/{id}", operation_id="update_by_id", response_model=UpdateTodoResponse)
def update_todo(id: str, data: UpdateTodoRequest):
    return update_todo_use_case(id, data)
