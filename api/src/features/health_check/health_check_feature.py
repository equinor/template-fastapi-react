from fastapi import APIRouter, status
from fastapi.responses import PlainTextResponse

router = APIRouter(tags=["health_check"], prefix="/health-check")


@router.get(
    "",
    responses={status.HTTP_200_OK: {"model": str, "content": {"plain/text": {"example": "OK"}}}},
)
async def get() -> PlainTextResponse:
    return PlainTextResponse("OK")
