from typing import List

from pydantic.fields import Field
from pydantic.main import BaseModel

from authentication.models import PATData, User
from common.use_case import use_case_responses
from features.personal_access_token.interfaces.PersonalAccessTokenRepositoryInterface import (
    PersonalAccessTokenRepositoryInterface,
)
from infrastructure.repositories.PersonalAccessTokenRepository import (
    PersonalAccessTokenRepository,
)


class GetPatByUsernameResponse(BaseModel):
    id: str = Field(...)
    title: str = Field(...)

    @staticmethod
    def from_entity(pat: PATData) -> "GetPatByUsernameResponse":
        return GetPatByUsernameResponse(
            pat_hash=pat.pat_hash,
            uuid=pat.uuid,
            user_id=pat.user_id,
            roles=pat.roles,
            scope=pat.scope,
            expire=pat.expire,
        )


@use_case_responses
def get_pat_by_user_use_case(
    user: User,
    pat_repository: PersonalAccessTokenRepositoryInterface = PersonalAccessTokenRepository(),
) -> List[GetPatByUsernameResponse]:
    return pat_repository.get_by_username(user.username)
