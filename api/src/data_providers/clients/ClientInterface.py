from abc import abstractmethod
from typing import Dict, Generic, List, Optional, TypeVar

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

    @abstractmethod
    def delete_many(self, query: Dict):
        pass

    @abstractmethod
    def find(self, filters: Dict) -> M:
        pass

    @abstractmethod
    def find_one(self, filters: Dict) -> Optional[M]:
        pass
