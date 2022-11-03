import useTodos from '../../../hooks/useTodos'
import { useState } from 'react'
import { Button, CircularProgress, Input } from '@equinor/eds-core-react'
import TodoItem from './TodoItem'
import { AddTodoResponse } from '../../../api/generated'
import { StyledTodoList } from './TodoList.styled'

const AddItem = (props: any) => {
  const { onAddItem } = props
  const [value, setValue] = useState('')

  const handleAddItem = (event: any) => {
    event.preventDefault()
    if (!value) return
    onAddItem(value)
  }

  return (
    <div className="form">
      <form onSubmit={handleAddItem}>
        <Input
          className="input"
          placeholder="Add Task"
          onChange={(e) => setValue(e.target.value)}
        />
        <Button className="add-button" type="submit">
          Add
        </Button>
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
      {todos?.map((todo: AddTodoResponse, index: number) => (
        <TodoItem
          key={`${index}-${todo.is_completed}`}
          onToggle={toggleItem}
          onRemove={removeItem}
          todo={todo}
          index={index}
        />
      ))}
    </StyledTodoList>
  )
}

export default TodoList
