import { Button, Input } from '@equinor/eds-core-react'
import { AxiosError } from 'axios'
import { FormEventHandler, useEffect, useState } from 'react'
import { AddTodoResponse, ErrorResponse } from '../../../api/generated'
import { useTodos } from '../../../contexts/TodoContext'
import { useTodoAPI } from '../../../hooks/useTodoAPI'
import TodoItem from './TodoItem'
import { StyledInput, StyledTodoList } from './TodoList.styled'

const AddItem = () => {
  const todoAPI = useTodoAPI()
  const { dispatch } = useTodos()
  const [value, setValue] = useState('')

  const addTodo: FormEventHandler = (event) => {
    event.preventDefault()
    if (value) {
      todoAPI
        .create({ addTodoRequest: { title: value } })
        .then((response) => response.data)
        .catch((error: AxiosError<ErrorResponse>) => {
          throw new Error(error.message)
        })
        .then((todo) => dispatch({ type: 'ADD_TODO', payload: todo }))
    }
    setValue('')
  }

  return (
    <div className="form">
      <form onSubmit={addTodo}>
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
  const todoAPI = useTodoAPI()
  const { state, dispatch } = useTodos()

  useEffect(() => {
    function fetchTodos() {
      const todos = todoAPI
        .getAll()
        .then((response) => response.data)
        .catch((error: AxiosError<ErrorResponse>) => {
          throw new Error(error.message)
        })
      return todos
    }

    fetchTodos().then((todos) =>
      dispatch({ type: 'INITIALIZE', payload: todos })
    )
  }, [dispatch, todoAPI])

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
