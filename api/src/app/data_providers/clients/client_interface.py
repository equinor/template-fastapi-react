from abc import ABCMeta, abstractmethod
from typing import Any

# Type definition for filter
type FilterDict = dict[str, Any]


class ClientInterface[Model, ID](metaclass=ABCMeta):
    @abstractmethod
    def create(self, instance: Model) -> Model:
        pass

    @abstractmethod
    def delete(self, id: ID) -> bool:
        pass

    @abstractmethod
    def get(self, id: ID) -> Model:
        pass

    @abstractmethod
    def list_collection(self) -> list[Model]:
        pass

    @abstractmethod
    def update(self, id: ID, instance: Model) -> Model:
        pass

    @abstractmethod
    def insert_many(self, instances: list[Model]) -> None:
        pass

    @abstractmethod
    def delete_many(self, filter: FilterDict) -> None:
        pass

    @abstractmethod
    def find(self, filter: FilterDict) -> Model:
        pass

    @abstractmethod
    def find_one(self, filter: FilterDict) -> Model | None:
        pass

    @abstractmethod
    def delete_collection(self) -> None:
        pass
