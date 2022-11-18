import { StyledTodoItemTitle } from './TodoItem.styled'
import {
  Button,
  Card,
  Typography,
  Icon,
  Tooltip,
} from '@equinor/eds-core-react'
import { undo, done, remove_outlined } from '@equinor/eds-icons'
import { TodoItem } from '../../../api/generated'

const TodoItemCard = (props: {
  todo: TodoItem
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
              data={todo.is_completed ? undo : done}
              size={24}
              title={todo.is_completed ? 'incomplete' : 'done'}
            />
          </Button>
        </Tooltip>
        <Tooltip title="Remove">
          <Button variant="ghost_icon" onClick={() => onRemove(todo.id)}>
            <Icon data={remove_outlined} size={24} title="Remove" />
          </Button>
        </Tooltip>
      </Card.Header>
    </Card>
  )
}

export default TodoItemCard
