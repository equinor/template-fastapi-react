import { Card, Typography } from '@equinor/eds-core-react'
import { done, remove_outlined, undo } from '@equinor/eds-icons'
import type { AddTodoResponse } from '../../../api/generated'
import IconButton from '../../../common/components/IconButton'
import { useTodoAPI } from '../../../hooks/useTodoAPI'
import { StyledTodoItemTitle } from './TodoItem.styled'

const TodoItem = ({ todo }: { todo: AddTodoResponse }) => {
  const { toggleTodoItem, removeTodoItem } = useTodoAPI()

  async function toggle() {
    await toggleTodoItem(todo)
  }

  async function remove() {
    await removeTodoItem(todo)
  }

  return (
    <Card>
      <Card.Header>
        <Card.HeaderTitle>
          <StyledTodoItemTitle variant="h5" $isStruckThrough={todo.is_completed}>
            {todo.title}
          </StyledTodoItemTitle>
          <Typography variant="body_short">{todo.is_completed ? 'Done' : 'Todo'}</Typography>
        </Card.HeaderTitle>
        <IconButton
          title={`Mark as ${todo.is_completed ? 'todo' : 'done'}`}
          icon={todo.is_completed ? undo : done}
          onClick={toggle}
        />
        <IconButton title={'Remove'} icon={remove_outlined} onClick={remove} />
      </Card.Header>
    </Card>
  )
}

export default TodoItem
