from abc import abstractmethod
from typing import Generic, List, TypeVar

# Type definition for Model
M = TypeVar("M")

# Type definition for Unique Id
K = TypeVar("K")


class ClientInterface(Generic[M, K]):
    @abstractmethod
    def create(self, instance: M) -> M:
        pass

    @abstractmethod
    def delete(self, id: K) -> None:
        pass

    @abstractmethod
    def get(self, id: K) -> M:
        pass

    @abstractmethod
    def list(self) -> List[M]:
        pass

    @abstractmethod
    def update(self, id: K, instance: M) -> M:
        pass

    @abstractmethod
    def insert_many(self, instances: List[M]):
        pass
