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
    400: {"model": ErrorResponse, "content": {"application/json": {"example": BadRequestException().to_dict()}}},
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
    403: {
        "model": ErrorResponse,
        "content": {"application/json": {"example": MissingPrivilegeException().to_dict()}},
    },
    404: {"model": ErrorResponse, "content": {"application/json": {"example": NotFoundException().to_dict()}}},
    422: {"model": ErrorResponse, "content": {"application/json": {"example": ValidationException().to_dict()}}},
    500: {"model": ErrorResponse, "content": {"application/json": {"example": ApplicationException().to_dict()}}},
}
