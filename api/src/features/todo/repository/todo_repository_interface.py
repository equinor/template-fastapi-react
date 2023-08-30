from abc import ABCMeta, abstractmethod

from features.todo.entities.todo_item import TodoItem


class TodoRepositoryInterface(metaclass=ABCMeta):
    @abstractmethod
    def create(self, todo_item: TodoItem) -> TodoItem | None:
        raise NotImplementedError

    @abstractmethod
    def get(self, todo_item_id: str) -> TodoItem:
        raise NotImplementedError

    @abstractmethod
    def update(self, todo_item: TodoItem) -> TodoItem:
        raise NotImplementedError

    @abstractmethod
    def delete(self, todo_item_id: str):
        raise NotImplementedError

    @abstractmethod
    def get_all(self) -> list[TodoItem]:
        raise NotImplementedError
