import {
  Button,
  Card,
  Icon,
  Tooltip,
  Typography,
} from '@equinor/eds-core-react'
import { done, remove_outlined, undo } from '@equinor/eds-icons'
import { AxiosError } from 'axios'
import { AddTodoResponse, ErrorResponse } from '../../../api/generated'
import { useTodos } from '../../../contexts/TodoContext'
import { useTodoAPI } from '../../../hooks/useTodoAPI'
import { StyledTodoItemTitle } from './TodoItem.styled'

const TodoItem = ({ todo }: { todo: AddTodoResponse }) => {
  const todoAPI = useTodoAPI()
  const { dispatch } = useTodos()

  function toggleTodo(todo: AddTodoResponse) {
    todoAPI
      .updateById({
        id: todo.id,
        updateTodoRequest: {
          is_completed: !todo.is_completed,
          title: todo.title,
        },
      })
      .catch((error: AxiosError<ErrorResponse>) => {
        throw new Error(error.message)
      })
      .then(() => dispatch({ type: 'TOGGLE_TODO', payload: todo }))
  }

  function removeTodo(todo: AddTodoResponse) {
    todoAPI
      .deleteById({ id: todo.id })
      .catch((error: AxiosError<ErrorResponse>) => {
        throw new Error(error.message)
      })
      .then(() => dispatch({ type: 'REMOVE_TODO', payload: todo }))
  }

  return (
    <Card>
      <Card.Header>
        <Card.HeaderTitle>
          <StyledTodoItemTitle
            variant="h5"
            className="todoTitle"
            is_completed={todo.is_completed}
          >
            {todo.title}
          </StyledTodoItemTitle>
          <Typography variant="body_short">
            {todo.is_completed ? 'Done' : 'Todo'}
          </Typography>
        </Card.HeaderTitle>
        <Tooltip title={`Mark as ${todo.is_completed ? 'incomplete' : 'done'}`}>
          <Button variant="ghost_icon" onClick={() => toggleTodo(todo)}>
            <Icon
              data={todo.is_completed ? undo : done}
              size={24}
              title={todo.is_completed ? 'incomplete' : 'done'}
            />
          </Button>
        </Tooltip>
        <Tooltip title="Remove">
          <Button variant="ghost_icon" onClick={() => removeTodo(todo)}>
            <Icon data={remove_outlined} size={24} title="Remove" />
          </Button>
        </Tooltip>
      </Card.Header>
    </Card>
  )
}

export default TodoItem
