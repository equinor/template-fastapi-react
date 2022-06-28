from typing import Optional

from fastapi import HTTPException
from starlette import status


class ApplicationException(Exception):
    def __init__(self, message: Optional[str] = "Something went wrong"):
        super()
        self.message = message

    def __str__(self):
        return self.message


class EntityNotFoundException(ApplicationException):
    def __init__(self, message: str = None):
        super().__init__(message)


class BadRequest(ApplicationException):
    def __init__(self, message: str = None):
        super().__init__(message)


class MissingPrivilegeException(Exception):
    def __init__(self, message=None):
        self.message = message if message else "Missing privileges to perform operation on the resource"


credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Token validation failed",
    headers={"WWW-Authenticate": "Bearer"},
)
