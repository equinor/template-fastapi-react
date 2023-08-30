import traceback
import uuid

from fastapi import FastAPI
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from httpx import HTTPStatusError
from starlette import status
from starlette.requests import Request
from starlette.responses import JSONResponse

from common.exceptions import (
    ApplicationException,
    BadRequestException,
    ErrorResponse,
    ExceptionSeverity,
    MissingPrivilegeException,
    NotFoundException,
    ValidationException,
)
from common.logger import logger


def add_exception_handlers(app: FastAPI) -> None:
    # Handle custom exceptions
    app.add_exception_handler(BadRequestException, generic_exception_handler)
    app.add_exception_handler(ValidationException, generic_exception_handler)
    app.add_exception_handler(NotFoundException, generic_exception_handler)
    app.add_exception_handler(MissingPrivilegeException, generic_exception_handler)

    # Override built-in default handler
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(HTTPStatusError, http_exception_handler)

    # Fallback exception handler for all unexpected exceptions
    app.add_exception_handler(Exception, fall_back_exception_handler)


def fall_back_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    error_id = uuid.uuid4()
    traceback_string = " ".join(traceback.format_tb(tb=exc.__traceback__))
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


def http_exception_handler(request: Request, exc: HTTPStatusError):
    logger.error(exc)
    return JSONResponse(
        ErrorResponse(
            type="ExternalFetchException",
            status=exc.response.status_code,
            message="Failed to fetch an external resource",
            debug=exc.response,
        )
    )
