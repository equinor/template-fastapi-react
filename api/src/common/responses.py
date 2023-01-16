import functools
import traceback
from inspect import iscoroutinefunction
from typing import Any, Callable, Type, TypeVar

from httpx import HTTPStatusError
from starlette import status
from starlette.responses import JSONResponse, Response

from common.exceptions import (
    ApplicationException,
    BadRequestException,
    ErrorResponse,
    MissingPrivilegeException,
    NotFoundException,
    ValidationException,
)
from common.logger import logger

responses: dict[int | str, dict[str, Any]] = {
    400: {"model": ErrorResponse, "content": {"application/json": {"example": BadRequestException().dict()}}},
    401: {
        "model": ErrorResponse,
        "content": {
            "application/json": {
                "example": ErrorResponse(
                    status=401, type="UnauthorizedException", message="Token validation failed"
                ).dict()
            }
        },
    },
    403: {"model": ErrorResponse, "content": {"application/json": {"example": MissingPrivilegeException().dict()}}},
    404: {"model": ErrorResponse, "content": {"application/json": {"example": NotFoundException().dict()}}},
    422: {"model": ErrorResponse, "content": {"application/json": {"example": ValidationException().dict()}}},
    500: {"model": ErrorResponse, "content": {"application/json": {"example": ApplicationException().dict()}}},
}

TResponse = TypeVar("TResponse", bound=Response)

"""
Function made to be used as a decorator for a route.
It will execute the function, and return a successful response of the passed response class.
If the execution fails, it will return a JSONResponse with a standardized error model.
"""


def create_response(response_class: Type[TResponse]) -> Callable:
    def func_wrapper(func) -> Callable:
        @functools.wraps(func)
        async def wrapper_decorator(*args, **kwargs) -> TResponse | Response | JSONResponse:
            try:
                # Await function if needed
                if not iscoroutinefunction(func):
                    result = func(*args, **kwargs)
                else:
                    result = await func(*args, **kwargs)
                if isinstance(result, Response):  # The controller created the Response instance itself
                    return result
                if isinstance(result, list):
                    return response_class([result_entry.dict() for result_entry in result])
                return response_class(result.dict())
            except HTTPStatusError as http_error:
                error_response = ErrorResponse(
                    type="ExternalFetchException",
                    status=http_error.response.status,  # type: ignore
                    message="Failed to fetch an external resource",
                    debug=http_error.response,
                )
                logger.error(error_response)
                return JSONResponse(error_response.dict(), status_code=error_response.status)
            except ValidationException as e:
                logger.error(e)
                return JSONResponse(e.dict(), status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)
            except NotFoundException as e:
                logger.error(e)
                return JSONResponse(e.dict(), status_code=status.HTTP_404_NOT_FOUND)
            except BadRequestException as e:
                logger.error(e)
                logger.error(e.dict())
                return JSONResponse(e.dict(), status_code=status.HTTP_400_BAD_REQUEST)
            except MissingPrivilegeException as e:
                logger.warning(e)
                return JSONResponse(e.dict(), status_code=status.HTTP_403_FORBIDDEN)
            except Exception as e:
                traceback.print_exc()
                logger.error(f"Unexpected unhandled exception: {e}")
                return JSONResponse(ErrorResponse().dict(), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return wrapper_decorator  # type: ignore

    return func_wrapper
