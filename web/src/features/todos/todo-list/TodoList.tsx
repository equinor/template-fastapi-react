import useTodos from '../../../hooks/useTodos'
import { FormEventHandler, useState } from 'react'
import { Button, Input, Progress } from '@equinor/eds-core-react'
import TodoItem from './TodoItem'
import { AddTodoResponse } from '../../../api/generated'
import {
  StyledTodoList,
  StyledInput,
  SpinnerContainer,
} from './TodoList.styled'

const AddItem = (props: { onAddItem: (id: string) => void }) => {
  const { onAddItem } = props
  const [value, setValue] = useState('')

  const handleAddItem: FormEventHandler = (event) => {
    event.preventDefault()
    if (!value) return
    onAddItem(value)
  }

  return (
    <div className="form">
      <form onSubmit={handleAddItem}>
        <StyledInput>
          <Input
            className="input"
            placeholder="Add Task"
            onChange={(e) => setValue(e.target.value)}
          />
          <Button className="add-button" type="submit">
            Add
          </Button>
        </StyledInput>
      </form>
    </div>
  )
}

const TodoList = () => {
  const { todos, isLoading, addItem, removeItem, toggleItem, error } =
    useTodos()

  if (error)
    return <div>{error?.response?.data.message ?? 'Something went wrong!'}</div>

  return (
    <StyledTodoList>
      <AddItem onAddItem={addItem} />
      {todos?.map((todo: AddTodoResponse) => (
        <TodoItem
          key={todo.id}
          onToggle={toggleItem}
          onRemove={removeItem}
          todo={todo}
        />
      ))}
      {isLoading && (
        <SpinnerContainer>
          <Progress.Circular />
        </SpinnerContainer>
      )}
    </StyledTodoList>
  )
}

export default TodoList
