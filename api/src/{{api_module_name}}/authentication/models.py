from enum import IntEnum
from typing import Any, Literal, TypedDict, cast

from pydantic import BaseModel, Field, GetJsonSchemaHandler
from pydantic_core.core_schema import CoreSchema


class AccessLevel(IntEnum):
    WRITE = 2
    READ = 1
    NONE = 0

    def check_privilege(self, required_level: "AccessLevel") -> bool:
        if self.value >= required_level.value:
            return True
        return False

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema: CoreSchema, handler: GetJsonSchemaHandler, /) -> dict[str, Any]:
        """
        Add a custom field type to the class representing the Enum's field names
        Ref: https://pydantic-docs.helpmanual.io/usage/schema/#modifying-schema-in-custom-fields

        The specific key 'x-enum-varnames' is interpreted by the openapi-generator-cli
        to provide names for the Enum values.
        Ref: https://openapi-generator.tech/docs/templating/#enum
        """
        json_schema = handler(core_schema)
        json_schema["x-enum-varnames"] = [choice.name for choice in cls]
        return json_schema


AccessLevelNames = Literal["WRITE", "READ", "NONE"]


class User(BaseModel):
    user_id: str  # If using azure AD authentication, user_id is the oid field from the access token.
    # If using another oauth provider, user_id will be from the "sub" attribute in the access token.
    email: str | None = None
    full_name: str | None = None
    roles: list[str] = []
    scope: AccessLevel = AccessLevel.WRITE

    def __hash__(self) -> int:
        return hash(type(self.user_id))


class ACLDict(TypedDict):
    owner: str
    roles: dict[str, AccessLevelNames]
    users: dict[str, AccessLevelNames]
    others: str


class ACL(BaseModel):
    """
    acl:
      owner: 'user_id'
      roles:
        'role': WRITE
      users:
        'user_id': WRITE
      others: READ
    """

    owner: str
    roles: dict[str, AccessLevel] = Field(default_factory=dict)
    users: dict[str, AccessLevel] = Field(default_factory=dict)
    others: AccessLevel = AccessLevel.READ

    def model_dump(self, **kwargs: dict[str, Any]) -> ACLDict:  # type: ignore[override]
        return {
            "owner": self.owner,
            "roles": cast(dict[str, AccessLevelNames], {k: v.name for k, v in self.roles.items()}),
            "users": cast(dict[str, AccessLevelNames], {k: v.name for k, v in self.users.items()}),
            "others": self.others.name,
        }
