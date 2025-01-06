from fastapi import APIRouter, status
from fastapi.responses import PlainTextResponse

from common.exception_handlers import ExceptionHandlingRoute

router = APIRouter(tags=["health_check"], prefix="/health-check", route_class=ExceptionHandlingRoute)


@router.get(
    "",
    responses={status.HTTP_200_OK: {"model": str, "content": {"plain/text": {"example": "OK"}}}},
)
async def get() -> PlainTextResponse:
    return PlainTextResponse("OK")
