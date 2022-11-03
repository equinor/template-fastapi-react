import useTodos from '../../../hooks/useTodos'
import { useState } from 'react'
import { Button, CircularProgress, Input } from '@equinor/eds-core-react'
import TodoItem from './TodoItem'
import { AddTodoResponse } from '../../../api/generated'
import { StyledTodoList, StyledInput } from './TodoList.styled'

const AddItem = (props: { onAddItem: (id: string) => void }) => {
  const { onAddItem } = props
  const [value, setValue] = useState('')

  const handleAddItem = (event: Event) => {
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
  const [todos, isLoading, addItem, removeItem, toggleItem, error] = useTodos()

  if (isLoading) return <CircularProgress />

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
    </StyledTodoList>
  )
}

export default TodoList
