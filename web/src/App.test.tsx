import { render, screen } from '@testing-library/react'
import App from './App'

test('renders without crashing', () => {
  render(<App />)
})
test('has an input field', () => {
  render(<App />)
  expect(screen.getByPlaceholderText('Add Task')).toBeDefined()
})
test('has an Add button', () => {
  render(<App />)
  expect(screen.getByText('Add')).toBeDefined()
})
