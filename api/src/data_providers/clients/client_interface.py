from abc import abstractmethod
from typing import Any, Generic, TypeVar

# Type definition for Model
M = TypeVar("M")

# Type definition for Unique Id
K = TypeVar("K")

# Type definition for filter
FilterDict = dict[str, Any]


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
    def insert_many(self, instances: list[M]) -> None:
        pass

    @abstractmethod
    def delete_many(self, filter: FilterDict) -> None:
        pass

    @abstractmethod
    def find(self, filter: FilterDict) -> M:
        pass

    @abstractmethod
    def find_one(self, filter: FilterDict) -> M | None:
        pass

    @abstractmethod
    def delete_collection(self) -> None:
        pass
