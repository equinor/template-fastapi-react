from common.entity_mapper import filter_fields
from entities.TodoItem import TodoItem


# An alternative solution is to use Pydantic BaseModel
# and to duplicate all the fields except user_id
@filter_fields(name="TodoItem")
class TodoItemResponseModel(TodoItem):
    class Config:
        exclude = ["user_id"]
