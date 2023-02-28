import React, { createContext, useContext, useReducer } from 'react'
import { AddTodoResponse } from '../api/generated'

/**
 * Definitions of the types of actions an user can do,
 * that will trigger an update of state.
 */
enum ActionType {
  ADD_TODO = 'ADD_TODO',
  REMOVE_TODO = 'REMOVE_TODO',
  TOGGLE_TODO = 'TOGGLE_TODO',
}
type Action = { type: `${ActionType}`; payload: AddTodoResponse }
type Dispatch = (action: Action) => void
type State = { todos: AddTodoResponse[] }
type TodoProviderProps = { children: React.ReactNode }

const TodoContext = createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined)

function TodoProvider({ children }: TodoProviderProps) {
  const [state, dispatch] = useReducer(todoReducer, { todos: [] })
  const value = { state, dispatch }

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>
}

function todoReducer(state: State, action: Action) {
  switch (action.type) {
    case 'ADD_TODO': {
      return {
        ...state,
        todos: [...state.todos, action.payload],
      }
    }
    case 'REMOVE_TODO': {
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload.id),
      }
    }
    case 'TOGGLE_TODO': {
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo !== action.payload
            ? todo
            : { ...todo, is_completed: !todo.is_completed }
        ),
      }
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

// Custom hook to get the provided context value from TodoProvider
function useTodos() {
  const context = useContext(TodoContext)
  if (context === undefined) {
    throw new Error('useTodos must be used within a TodoProvider')
  }
  return context
}

export { TodoProvider, useTodos }
