from typing import Optional

from authentication.models import PATData
from common.utils.encryption import scrypt
from features.personal_access_token.interfaces.PersonalAccessTokenRepositoryInterface import (
    PersonalAccessTokenRepositoryInterface,
)
from infrastructure.clients.ClientInterface import ClientInterface
from infrastructure.clients.mongodb.MongoClient import get_mongo_client


class PersonalAccessTokenRepository(PersonalAccessTokenRepositoryInterface):
    client: ClientInterface

    def __init__(
        self,
        client: ClientInterface = get_mongo_client(collection="personal_access_tokens"),
    ):
        self.client = client

    def delete_by_id_and_username(self, id: str, username: str):
        pass

    def get_by_id(self, pat: str) -> Optional[PATData]:
        # Hash the token and lookup the PAT Object stored with that hash as an '_id'
        pat_dict = self.client.find_by_id(scrypt(pat))
        if not pat_dict:
            return None
        return PATData(**pat_dict)

    def create(self, pat: PATData) -> None:
        self.client.create(pat.dict())

    def get_by_username(self, username: str) -> list[PATData]:
        # Filter out the hashed "_id" attribute
        pat_list = [
            pat
            for pat in self.client.find_by_filter(
                filter={"username": username}, projection={"_id": False}
            )
        ]
        return pat_list

    def get_all(self) -> list[PATData]:
        return self.client.get_all()
