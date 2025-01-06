import traceback
import uuid
from collections.abc import Callable, Coroutine
from typing import Any

from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.routing import APIRoute
from httpx import HTTPStatusError
from starlette import status
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from common.exceptions import (
    ApplicationException,
    BadRequestException,
    ErrorResponse,
    ExceptionSeverity,
    MissingPrivilegeException,
    NotFoundException,
    UnauthorizedException,
    ValidationException,
)
from common.logger import logger


def fall_back_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    error_id = uuid.uuid4()
    traceback_string = " ".join(traceback.format_tb(tb=exc.__traceback__))
    print(traceback_string)
    logger.error(
        f"Unexpected unhandled exception ({error_id}): {exc}",
        extra={"custom_dimensions": {"Error ID": error_id, "Traceback": traceback_string}},
    )
    return JSONResponse(
        ErrorResponse(
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            type=str(exc.__class__.__name__),
            message="Unexpected unhandled exception",
            debug=f"Contact admin for further info ({error_id})",
        ).model_dump(),
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


def generic_exception_handler(request: Request, exc: ApplicationException) -> JSONResponse:
    if exc.severity == ExceptionSeverity.CRITICAL:
        logger.critical(exc)
    elif exc.severity == ExceptionSeverity.WARNING:
        logger.warning(exc)
    else:
        logger.error(exc)

    return JSONResponse(
        ErrorResponse(
            status=exc.status,
            type=exc.type,
            message=exc.message,
            debug=exc.debug,
            extra=jsonable_encoder(exc.extra),
        ).model_dump(),
        status_code=exc.status,
    )


def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    logger.error(exc)
    return JSONResponse(
        ErrorResponse(
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            type="RequestValidationError",
            message="The received values are invalid",
            debug="The received values are invalid according to the endpoints model definition",
            extra=jsonable_encoder({"detail": exc.errors(), "body": exc.body}),
        ).model_dump(),
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
    )


def http_exception_handler(request: Request, exc: HTTPStatusError) -> JSONResponse:
    logger.error(exc)
    return JSONResponse(
        ErrorResponse(
            type="ExternalFetchException",
            status=exc.response.status_code,
            message="Failed to fetch an external resource",
            debug=exc.response,
        )
    )


class ExceptionHandlingRoute(APIRoute):
    """APIRoute class for handling exceptions."""

    def get_route_handler(self) -> Callable[[Request], Coroutine[Any, Any, Response]]:
        """Intercept response and return correct exception response."""
        original_route_handler = super().get_route_handler()

        async def custom_route_handler(request: Request) -> Response:
            try:
                return await original_route_handler(request)
            except BadRequestException as e:
                return generic_exception_handler(request, e)
            except ValidationException as e:
                return generic_exception_handler(request, e)
            except NotFoundException as e:
                return generic_exception_handler(request, e)
            except MissingPrivilegeException as e:
                return generic_exception_handler(request, e)
            except RequestValidationError as e:
                return validation_exception_handler(request, e)
            except HTTPStatusError as e:
                return http_exception_handler(request, e)
            except UnauthorizedException as e:
                return generic_exception_handler(request, e)
            except Exception as e:
                return fall_back_exception_handler(request, e)

        return custom_route_handler
