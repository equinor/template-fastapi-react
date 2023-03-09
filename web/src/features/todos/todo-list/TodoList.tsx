import { Button, Input } from '@equinor/eds-core-react'
import { FormEventHandler, useEffect, useState } from 'react'
import { AddTodoResponse } from '../../../api/generated'
import { useTodos } from '../../../contexts/TodoContext'
import { useTodoAPI } from '../../../hooks/useTodoAPI'
import TodoItem from './TodoItem'
import { StyledInput, StyledTodoList } from './TodoList.styled'

const AddItem = () => {
  const { addTodo } = useTodoAPI()
  const { dispatch } = useTodos()
  const [value, setValue] = useState('')

  const add: FormEventHandler = (event) => {
    event.preventDefault()
    if (value) {
      addTodo(value).then((todo) =>
        dispatch({ type: 'ADD_TODO', payload: todo })
      )
    }
    setValue('')
  }

  return (
    <div className="form">
      <form onSubmit={add}>
        <StyledInput>
          <Input
            value={value}
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
  const { getAllTodos } = useTodoAPI()
  const { state, dispatch } = useTodos()

  useEffect(() => {
    getAllTodos().then((todos) =>
      dispatch({ type: 'INITIALIZE', payload: todos })
    )
  }, [dispatch, getAllTodos])

  return (
    <StyledTodoList>
      <AddItem />
      {state.todos.map((todo: AddTodoResponse) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </StyledTodoList>
  )
}

export default TodoList
