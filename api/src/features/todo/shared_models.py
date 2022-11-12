from common.entity_mapper import filter_fields
from entities.TodoItem import TodoItem


@filter_fields(name="TodoItem")
class TodoItemResponseModel(TodoItem):
    class Config:
        exclude = ["user_id"]
