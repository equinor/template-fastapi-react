from pydantic import BaseModel, Field

from authentication.models import User
from features.personal_access_token.interfaces.PersonalAccessTokenRepositoryInterface import (
    PersonalAccessTokenRepositoryInterface,
)
from infrastructure.repositories.PersonalAccessTokenRepository import (
    PersonalAccessTokenRepository,
)


class DeletePatResponse(BaseModel):
    success: bool = Field(...)


def delete_pat_by_token_id_and_user_use_case(
    token_id: str,
    user: User,
    pat_repository: PersonalAccessTokenRepositoryInterface = PersonalAccessTokenRepository(),
) -> DeletePatResponse:
    if pat_repository.delete_by_id_and_username(token_id, user.username):
        return DeletePatResponse(success=True)
    return DeletePatResponse(success=False)
