import React, { useEffect, useContext, useState } from 'react'
import { AuthContext, AuthProvider, TAuthConfig } from 'react-oauth2-code-pkce'
import TodoAPI from '../api/TodoAPI'
import { AddTodoResponse, GetTodoAllResponse } from '../api/generated'
import styled from 'styled-components'

export const ToDoContainer = styled.div`
  width: 400px;
  padding: 30px;
`

export const ToDoItem = styled.div`
  font-weight: bold;
  cursor: pointer;
  text-decoration: ${(props: { is_completed?: boolean }) =>
    props.is_completed ? 'line-through' : 'none'};
`

export const Header = styled.h4`
  text-transform: capitalize;
  letter-spacing: 1px;
  font-weight: bold;
  text-align: center;
`

export const Input = styled.input`
  width: 100%;
  border: 1px solid #f2f2f2;
  padding: 10px;
  margin-bottom: 10px;
`

const StyledButton = styled.button`
  background: palevioletred;
  color: #fff;
  border-radius: 3px;
  border: 2px solid palevioletred;
  padding: 3px 10px;
  outline: none;
  cursor: pointer;
`
const ItemWrapper = styled.div`
  display: flex;
  padding: 4px;
`

const ItemTitle = styled.div`
  flex: 1 1 auto;
`

export const TodoApp = () => {
  const { tokenData, token } = useContext(AuthContext)
  const [todos, setTodos] = useState<AddTodoResponse[]>([])
  const [value, setValue] = React.useState('')

  const todoAPI = new TodoAPI(token)

  useEffect(() => {
    todoAPI
      .getAll()
      .then((response) => setTodos(response.data))
  }, [])

  const addItem = (event: any) => {
    event.preventDefault()
    if (!value) return

    todoAPI
      .create({
        addTodoRequest: {
          title: value,
        },
      })
      .then((response) => {
        const item: AddTodoResponse = response.data
        const items = [...todos, item]
        setTodos(items)
      })
  }

  const handleRemove = (id: string, index: number) =>
    todoAPI.deleteById({ id: id }).then((response) => {
      const newTodos = [...todos]
      newTodos.splice(index, 1)
      setTodos(newTodos)
    })

  const handleToggle = (id: string, is_completed: boolean, index: number) => {
    todoAPI
      .updateById({
        id: id,
        updateTodoRequest: {
          is_completed: !is_completed,
          title: todos[index].title,
        },
      })
      .then((response) => {
        const items = todos
        const item = items[index]
        item.is_completed = !is_completed
        items[index] = item
        setTodos([...items])
      })
  }

  return (
    <ToDoContainer>
      <Header>Template Fastapi React</Header>
      <div>Logged inn as: {token && tokenData?.['unique_name']}</div>
      <div className="form">
        <form onSubmit={addItem}>
          <Input
            className="input"
            placeholder="Add Task"
            onChange={(e) => setValue(e.target.value)}
          />
          <StyledButton className="add-button" type="submit">
            Add
          </StyledButton>
        </form>
      </div>
      {todos.map((todo, index) => (
        <ToDoItem
          is_completed={todo.is_completed}
          key={`${index}-${todo.is_completed}`}
          onClick={() => handleToggle(todo.id, todo.is_completed as boolean, index)}
        >
          <ItemWrapper>
            <ItemTitle>{todo.title}</ItemTitle>
            <StyledButton onClick={() => handleRemove(todo.id, index)}>
              Remove
            </StyledButton>
          </ItemWrapper>
        </ToDoItem>
      ))}
    </ToDoContainer>
  )
}