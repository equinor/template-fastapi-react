from __future__ import annotations

from pydantic import BaseModel, Field

title_field = Field(
    ..., title="The title of the item", max_length=30, min_length=1, example="Read about clean architecture"
)


class TodoItem(BaseModel):
    id: str
    user_id: str
    title: str = title_field
    is_completed: bool = False

    @classmethod
    def from_dict(cls, dict_) -> "TodoItem":
        class_fields = {field for field in cls.__fields__}
        if "_id" in dict_:
            dict_["id"] = dict_.pop("_id")
        data = {k: v for k, v in dict_.items() if k in class_fields}
        return TodoItem(**data)
