from typing import Self

from pydantic import BaseModel

from app.common.logger import logger
from app.common.telemetry import tracer
from app.features.todo.entities.todo_item import TodoItem
from app.features.todo.repository.todo_repository_interface import TodoRepositoryInterface


class GetTodoAllResponse(BaseModel):
    id: str
    title: str
    is_completed: bool

    @classmethod
    def from_entity(cls, todo_item: TodoItem) -> Self:
        return cls(id=todo_item.id, title=todo_item.title, is_completed=todo_item.is_completed)


# Telemetry example: Initialize a span that will be used to log telemetry data
@tracer.start_as_current_span("get_todo_all_use_case")  # type: ignore
def get_todo_all_use_case(
    user_id: str,
    todo_repository: TodoRepositoryInterface,
) -> list[GetTodoAllResponse]:
    # Telemetry example
    logger.info(
        f"Get todos for user: {user_id}"
    )  # This log message will be logged within the span context defined above
    return [
        GetTodoAllResponse.from_entity(todo_item)
        for todo_item in todo_repository.get_all()
        if todo_item.user_id == user_id
    ]
