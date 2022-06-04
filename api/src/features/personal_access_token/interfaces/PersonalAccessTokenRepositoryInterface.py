from abc import ABCMeta, abstractmethod
from typing import Optional

from authentication.models import PATData


class PersonalAccessTokenRepositoryInterface(metaclass=ABCMeta):
    @abstractmethod
    def create(self, pat: PATData) -> Optional[PATData]:
        raise NotImplementedError

    @abstractmethod
    def get_by_id(self, id: str) -> Optional[PATData]:
        raise NotImplementedError

    @abstractmethod
    def get_by_username(self, username: str) -> list[PATData]:
        raise NotImplementedError

    @abstractmethod
    def delete_by_id_and_username(self, id: str, username: str):
        raise NotImplementedError

    @abstractmethod
    def get_all(self) -> list[PATData]:
        raise NotImplementedError
