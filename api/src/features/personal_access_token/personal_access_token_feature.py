from datetime import timedelta

from fastapi import APIRouter, Depends

from authentication.access_control import AccessLevel
from authentication.authentication import auth_with_jwt
from authentication.models import PATData, User
from features.personal_access_token.use_cases.create_pat import create_pat_use_case
from features.personal_access_token.use_cases.delete_pat_by_token_id_and_user import (
    DeletePatResponse,
    delete_pat_by_token_id_and_user_use_case,
)
from features.personal_access_token.use_cases.get_pat_by_user import (
    GetPatByUsernameResponse,
    get_pat_by_user_use_case,
)

router = APIRouter(tags=["personal_access_token"], prefix="/token")


@router.post("", operation_id="create_token")
def new_personal_access_token(
    scope: AccessLevel = AccessLevel.WRITE,
    time_to_live: int = timedelta(days=30).total_seconds(),
    user: User = Depends(auth_with_jwt),
) -> str:
    return create_pat_use_case(user, scope, time_to_live)


@router.delete(
    "/token/{token_id}", operation_id="token_delete", response_model=DeletePatResponse
)
def revoke_personal_access_token(token_id: str, user: User = Depends(auth_with_jwt)):
    return delete_pat_by_token_id_and_user_use_case(token_id, user)


@router.get(
    "/token", operation_id="token_list_all", response_model=GetPatByUsernameResponse
)
def list_all_pats(user: User = Depends(auth_with_jwt)) -> list[PATData]:
    return get_pat_by_user_use_case(user)
