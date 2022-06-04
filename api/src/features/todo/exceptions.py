from common.exceptions import EntityNotFoundException


class TodoItemNotFoundError(EntityNotFoundException):
    message = "The todo item you specified does not exist."

    def __str__(self):
        return TodoItemNotFoundError.message
