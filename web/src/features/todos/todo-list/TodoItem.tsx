import { Card, Typography } from '@equinor/eds-core-react'
import { done, remove_outlined, undo } from '@equinor/eds-icons'
import { AddTodoResponse } from '../../../api/generated'
import IconButton from '../../../common/components/IconButton'
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

  const statusOf = (isCompleted: boolean | undefined) =>
    isCompleted ? 'Done' : 'Todo'

  return (
    <Card>
      <Card.Header>
        <Card.HeaderTitle>
          <StyledTodoItemTitle variant="h5" isStruckThrough={todo.is_completed}>
            {todo.title}
          </StyledTodoItemTitle>
          <Typography variant="body_short">
            {statusOf(todo.is_completed)}
          </Typography>
        </Card.HeaderTitle>
        <IconButton
          title={`Mark as ${statusOf(!todo.is_completed).toLowerCase()}`}
          icon={todo.is_completed ? undo : done}
          onClick={() => toggle(todo)}
        />
        <IconButton
          title={'Remove'}
          icon={remove_outlined}
          onClick={() => remove(todo)}
        />
      </Card.Header>
    </Card>
  )
}

export default TodoItem
