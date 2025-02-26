import type React from 'react'
import { createContext, useContext, useReducer } from 'react'
import type { AddTodoResponse } from '../api/generated'

// Type alias to make it make more sense in the code
type TodoItem = AddTodoResponse

/**
 * Definitions of the types of actions an user can do,
 * that will trigger an update of state.
 */
type Action =
  | { type: 'ADD_TODO'; payload: TodoItem }
  | { type: 'INITIALIZE'; payload: TodoItem[] }
  | { type: 'REMOVE_TODO'; payload: TodoItem }
  | { type: 'TOGGLE_TODO'; payload: TodoItem }
type Dispatch = (action: Action) => void
type State = { todos: TodoItem[] }
type TodoProviderProps = { children: React.ReactNode }

const TodoContext = createContext<{ state: State; dispatch: Dispatch } | undefined>(undefined)

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
    case 'INITIALIZE': {
      return {
        ...state,
        todos: action.payload,
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
          todo !== action.payload ? todo : { ...todo, is_completed: !todo.is_completed }
        ),
      }
    }
    default: {
      throw new Error(`Unhandled action type: ${action}`)
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
