from fastapi import APIRouter, status

router = APIRouter(tags=["health_check"], prefix="/health-check")


@router.get(
    "",
    status_code=status.HTTP_200_OK,
    responses={status.HTTP_200_OK: {"model": str, "content": {"application/json": {"example": "OK"}}}},
)
async def get() -> str:
    return "OK"
