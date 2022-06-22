from enum import IntEnum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class AccessLevel(IntEnum):
    WRITE = 2
    READ = 1
    NONE = 0

    def check_privilege(self, required_level: "AccessLevel") -> bool:
        if self.value >= required_level.value:
            return True
        return False

    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if isinstance(v, cls):
            return v
        try:
            return cls[v]
        except KeyError:
            raise ValueError("invalid AccessLevel enum value ")

    @classmethod
    def __modify_schema__(cls, schema: Dict[str, Any]):
        """
        Add a custom field type to the class representing the Enum's field names
        Ref: https://pydantic-docs.helpmanual.io/usage/schema/#modifying-schema-in-custom-fields

        The specific key 'x-enum-varnames' is interpreted by the openapi-generator-cli
        to provide names for the Enum values.
        Ref: https://openapi-generator.tech/docs/templating/#enum
        """
        schema["x-enum-varnames"] = [choice.name for choice in cls]


class User(BaseModel):
    user_id: str  # If using azure AD authentication, user_id is the oid field from the access token.
    # If using another oauth provider, user_id will be from the "sub" attribute in the access token.
    email: Optional[str] = None
    full_name: Optional[str] = None
    roles: List[str] = []
    scope: AccessLevel = AccessLevel.WRITE

    def __hash__(self):
        return hash((type(self.user_id)))


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
    roles: Dict[str, AccessLevel] = {}
    users: Dict[str, AccessLevel] = {}
    others: AccessLevel = AccessLevel.READ

    def dict(self, **kwargs):
        return {
            "owner": self.owner,
            "roles": {k: v.name for k, v in self.roles.items()},
            "users": {k: v.name for k, v in self.users.items()},
            "others": self.others.name,
        }
