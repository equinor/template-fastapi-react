from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from starlette import status
from starlette.requests import Request
from starlette.responses import JSONResponse

from common.exceptions import ErrorResponse


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        ErrorResponse(
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            type="RequestValidationError",
            message="The received values are invalid",
            debug="The received values are invalid according to the endpoints model definition",
            extra=jsonable_encoder({"detail": exc.errors(), "body": exc.body}),
        ).dict(),
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
    )
