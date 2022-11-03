import React from 'react'
import {
  StyledTodoContent,
  StyledTodoItem,
  StyledTodoItemTitle,
} from './TodoItem.styled'
import { Button } from '@equinor/eds-core-react'

const TodoItem = (props: any) => {
  const { todo, index, onToggle, onRemove } = props
  return (
    <StyledTodoItem
      is_completed={todo.is_completed}
      onClick={() => onToggle(todo.id, todo.is_completed as boolean, index)}
    >
      <StyledTodoContent>
        <StyledTodoItemTitle>{todo.title}</StyledTodoItemTitle>
        <Button onClick={() => onRemove(todo.id, index)}>Remove</Button>
      </StyledTodoContent>
    </StyledTodoItem>
  )
}

export default TodoItem
