from abc import abstractmethod
from typing import Any, Dict, Generic, List, TypeVar


class ClientInterface:

    # Create a new instance of the Model
    @abstractmethod
    def create(self, instance) -> dict:
        pass

    # Delete an existing instance of the Model
    @abstractmethod
    def delete(self, id: str) -> None:
        pass

    # Fetch an existing instance of the Model by it's unique Id
    @abstractmethod
    def find_by_id(self, id) -> dict:
        pass

    # Lists all existing instance of the Model
    @abstractmethod
    def list(self) -> List[dict]:
        pass

    # Updates an existing instance of the Model
    @abstractmethod
    def update(self, id: str, instance: dict) -> dict:
        pass
