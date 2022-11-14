from pydantic import BaseModel

from common.entity_mapper import filter_fields


class MyEntity(BaseModel):
    a: int
    b: str


def test_include_fields():
    @filter_fields()
    class MyModel(MyEntity):
        class Config:
            include = ["a"]

    schema = MyModel.schema()
    assert schema["properties"] == {"a": {"title": "A", "type": "integer"}}


def test_exclude_fields():
    @filter_fields()
    class MyModel(MyEntity):
        class Config:
            exclude = ["b"]

    schema = MyModel.schema()
    assert schema["properties"] == {"a": {"title": "A", "type": "integer"}}


def test_rename():
    @filter_fields(name="MySpecialModel")
    class MyModel(MyEntity):
        pass

    schema = MyModel.schema()

    assert schema["title"] == "MySpecialModel"
