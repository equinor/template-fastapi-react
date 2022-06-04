from typing import List

from fastapi import APIRouter

from common.use_case_executor import use_case_executor

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
    return use_case_executor(add_todo_use_case, data)


@router.get("/{id}", operation_id="get_by_id", response_model=GetTodoByIdResponse)
def get_todo_by_id(id: str):
    return use_case_executor(get_todo_by_id_use_case, id)


@router.delete(
    "/{id}", operation_id="delete_by_id", response_model=DeleteTodoByIdResponse
)
def delete_todo_by_id(id: str):
    return use_case_executor(delete_todo_use_case, id)


@router.get("", operation_id="get_all", response_model=List[GetTodoAllResponse])
def get_todo_all():
    return use_case_executor(get_todo_all_use_case)


@router.put("/{id}", operation_id="update_by_id", response_model=UpdateTodoResponse)
def update_todo(id: str, data: UpdateTodoRequest):
    return use_case_executor(update_todo_use_case, id, data)
