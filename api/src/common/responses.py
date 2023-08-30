from typing import Any

from common.exceptions import (
    ApplicationException,
    BadRequestException,
    ErrorResponse,
    MissingPrivilegeException,
    NotFoundException,
    ValidationException,
)

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
