from abc import ABCMeta, abstractmethod
from typing import Optional

from entities.TodoItem import TodoItem


class TodoRepositoryInterface(metaclass=ABCMeta):
    @abstractmethod
    def create(self, todo_item: TodoItem) -> Optional[TodoItem]:
        raise NotImplementedError

    @abstractmethod
    def get(self, id: str) -> Optional[TodoItem]:
        raise NotImplementedError

    @abstractmethod
    def update(self, todo_item: TodoItem) -> Optional[TodoItem]:
        raise NotImplementedError

    @abstractmethod
    def delete_by_id(self, id: str):
        raise NotImplementedError

    @abstractmethod
    def get_all(self) -> list[TodoItem]:
        raise NotImplementedError
