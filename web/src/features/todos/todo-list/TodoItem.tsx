import {
  Button,
  Card,
  Icon,
  Tooltip,
  Typography,
} from '@equinor/eds-core-react'
import { done, remove_outlined, undo } from '@equinor/eds-icons'
import { AddTodoResponse } from '../../../api/generated'
import { useTodos } from '../../../contexts/TodoContext'
import { useTodoAPI } from '../../../hooks/useTodoAPI'
import { StyledTodoItemTitle } from './TodoItem.styled'

const TodoItem = ({ todo }: { todo: AddTodoResponse }) => {
  const { toggleTodo, removeTodo } = useTodoAPI()
  const { dispatch } = useTodos()

  async function toggle(todo: AddTodoResponse) {
    await toggleTodo(todo)
    dispatch({ type: 'TOGGLE_TODO', payload: todo })
  }

  async function remove(todo: AddTodoResponse) {
    await removeTodo(todo)
    dispatch({ type: 'REMOVE_TODO', payload: todo })
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
          <Button variant="ghost_icon" onClick={() => toggle(todo)}>
            <Icon
              data={todo.is_completed ? undo : done}
              size={24}
              title={todo.is_completed ? 'incomplete' : 'done'}
            />
          </Button>
        </Tooltip>
        <Tooltip title="Remove">
          <Button variant="ghost_icon" onClick={() => remove(todo)}>
            <Icon data={remove_outlined} size={24} title="Remove" />
          </Button>
        </Tooltip>
      </Card.Header>
    </Card>
  )
}

export default TodoItem
