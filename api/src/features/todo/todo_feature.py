from typing import List

from fastapi import APIRouter
from starlette.responses import JSONResponse

from common.responses import create_response

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
def add_todo(data: AddTodoRequest):
    return add_todo_use_case(data).dict()


@router.get("/{id}", operation_id="get_by_id", response_model=GetTodoByIdResponse)
@create_response(JSONResponse)
def get_todo_by_id(id: str):
    return get_todo_by_id_use_case(id).dict()


@router.delete("/{id}", operation_id="delete_by_id", response_model=DeleteTodoByIdResponse)
@create_response(JSONResponse)
def delete_todo_by_id(id: str):
    return delete_todo_use_case(id).dict()


@router.get("", operation_id="get_all", response_model=List[GetTodoAllResponse])
@create_response(JSONResponse)
def get_todo_all():
    return [todo.dict() for todo in get_todo_all_use_case()]


@router.put("/{id}", operation_id="update_by_id", response_model=UpdateTodoResponse)
@create_response(JSONResponse)
def update_todo(id: str, data: UpdateTodoRequest):
    return update_todo_use_case(id, data).dict()
