from dataclasses import asdict, dataclass, fields


@dataclass(frozen=True)
class TodoItem:
    id: str
    user_id: str
    title: str
    is_completed: bool = False

    def to_dict(self):
        return asdict(self)

    @classmethod
    def from_dict(cls, dict_) -> "TodoItem":
        class_fields = {f.name for f in fields(cls)}
        if "_id" in dict_:
            dict_["id"] = dict_.pop("_id")
        data = {k: v for k, v in dict_.items() if k in class_fields}
        return TodoItem(**data)
