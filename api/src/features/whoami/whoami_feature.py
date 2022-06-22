from fastapi import APIRouter, Depends

from authentication.authentication import auth_with_jwt
from authentication.models import User

router = APIRouter(tags=["whoami"], prefix="/whoami")


@router.get("/", operation_id="whoami")
async def get_information_on_authenticated_user(
    user: User = Depends(auth_with_jwt),
):
    return user
