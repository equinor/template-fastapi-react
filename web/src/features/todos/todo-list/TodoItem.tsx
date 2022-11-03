import { StyledTodoItemTitle } from './TodoItem.styled'
import {
  Button,
  Card,
  Typography,
  Icon,
  Tooltip,
} from '@equinor/eds-core-react'
import { undo, done, remove_outlined } from '@equinor/eds-icons'
import { AddTodoResponse } from '../../../api/generated'

Icon.add({ undo, done, remove_outlined })

const TodoItem = (props: {
  todo: AddTodoResponse
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}) => {
  const { todo, onToggle, onRemove } = props
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
          <Button variant="ghost_icon" onClick={() => onToggle(todo.id)}>
            <Icon
              name={todo.is_completed ? 'undo' : 'done'}
              size={24}
              title={todo.is_completed ? 'incomplete' : 'done'}
            />
          </Button>
        </Tooltip>
        <Tooltip title="Remove">
          <Button variant="ghost_icon" onClick={() => onRemove(todo.id)}>
            <Icon name="remove_outlined" size={24} title="Remove" />
          </Button>
        </Tooltip>
      </Card.Header>
    </Card>
  )
}

export default TodoItem
