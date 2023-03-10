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
    def insert_many(self, instances: List[M]):
        pass

    @abstractmethod
    def delete_many(self, filter: Dict):
        pass

    @abstractmethod
    def find(self, filter: Dict) -> M:
        pass

    @abstractmethod
    def find_one(self, filter: Dict) -> Optional[M]:
        pass

    @abstractmethod
    def delete_collection(self):
        pass
