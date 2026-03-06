from app.authentication.authentication import auth_with_jwt
from app.authentication.models import User
from app.common.exception_handlers import ExceptionHandlingRoute
from fastapi import APIRouter, Depends

router = APIRouter(tags=["whoami"], prefix="/whoami", route_class=ExceptionHandlingRoute)


@router.get("", operation_id="whoami")
async def get_information_on_authenticated_user(
    user: User = Depends(auth_with_jwt),
) -> User:
    return user
