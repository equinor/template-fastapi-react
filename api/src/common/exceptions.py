from enum import Enum

from fastapi import HTTPException
from pydantic import BaseModel
from starlette import status as request_status


class ExceptionSeverity(Enum):
    WARNING = 1
    ERROR = 2
    CRITICAL = 3


# Pydantic models can not inherit from "Exception", but we use it for OpenAPI spec
class ErrorResponse(BaseModel):
    status: int = 500
    type: str = "ApplicationException"
    message: str = "The requested operation failed"
    debug: str = "An unknown and unhandled exception occurred in the API"
    extra: dict | None = None


class ApplicationException(Exception):
    status: int = 500
    severity: ExceptionSeverity = ExceptionSeverity.ERROR
    type: str = "ApplicationException"
    message: str = "The requested operation failed"
    debug: str = "An unknown and unhandled exception occurred in the API"
    extra: dict | None = None

    def __init__(
        self,
        message: str = "The requested operation failed",
        debug: str = "An unknown and unhandled exception occurred in the API",
        extra: dict | None = None,
        status: int = 500,
        severity: ExceptionSeverity = ExceptionSeverity.ERROR,
    ):
        self.status = status
        self.type = self.__class__.__name__
        self.message = message
        self.debug = debug
        self.extra = extra
        self.severity = severity

    def dict(self):
        return {
            "status": self.status,
            "type": self.type,
            "message": self.message,
            "debug": self.debug,
            "extra": self.extra,
        }


class MissingPrivilegeException(ApplicationException):
    def __init__(
        self,
        message: str = "You do not have the required permissions",
        debug: str = "Action denied because of insufficient permissions",
        extra: dict | None = None,
    ):
        super().__init__(message, debug, extra, request_status.HTTP_403_FORBIDDEN, severity=ExceptionSeverity.WARNING)
        self.type = self.__class__.__name__


class NotFoundException(ApplicationException):
    def __init__(
        self,
        message: str = "The requested resource could not be found",
        debug: str = "The requested resource could not be found",
        extra: dict | None = None,
    ):
        super().__init__(message, debug, extra, request_status.HTTP_404_NOT_FOUND)
        self.type = self.__class__.__name__


class BadRequestException(ApplicationException):
    def __init__(
        self,
        message: str = "Invalid data for the operation",
        debug: str = "Unable to complete the requested operation with the given input values.",
        extra: dict | None = None,
    ):
        super().__init__(message, debug, extra, request_status.HTTP_400_BAD_REQUEST)
        self.type = self.__class__.__name__


class ValidationException(ApplicationException):
    def __init__(
        self,
        message: str = "The received data is invalid",
        debug: str = "Values are invalid for requested operation.",
        extra: dict | None = None,
    ):
        super().__init__(message, debug, extra, request_status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.type = self.__class__.__name__


credentials_exception = HTTPException(
    status_code=request_status.HTTP_401_UNAUTHORIZED,
    detail="Token validation failed",
    headers={"WWW-Authenticate": "Bearer"},
)
