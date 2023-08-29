from abc import abstractmethod
from typing import Generic, TypeVar

# Type definition for Model
M = TypeVar("M")

# Type definition for Unique Id
K = TypeVar("K")


class ClientInterface(Generic[M, K]):
    @abstractmethod
    def create(self, instance: M) -> M:
        pass

    @abstractmethod
    def delete(self, id: K) -> bool:
        pass

    @abstractmethod
    def get(self, id: K) -> M:
        pass

    @abstractmethod
    def list_collection(self) -> list[M]:
        pass

    @abstractmethod
    def update(self, id: K, instance: M) -> M:
        pass

    @abstractmethod
    def insert_many(self, instances: list[M]):
        pass

    @abstractmethod
    def delete_many(self, filter: dict):
        pass

    @abstractmethod
    def find(self, filter: dict) -> M:
        pass

    @abstractmethod
    def find_one(self, filter: dict) -> M | None:
        pass

    @abstractmethod
    def delete_collection(self):
        pass
