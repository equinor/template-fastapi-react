import styled from 'styled-components'

export const StyledTodoItem = styled.div`
  font-weight: bold;
  cursor: pointer;
  text-decoration: ${(props: { is_completed?: boolean }) =>
    props.is_completed ? 'line-through' : 'none'};
`

export const StyledTodoContent = styled.div`
  display: flex;
  padding: 4px;
`

export const StyledTodoItemTitle = styled.div`
  flex: 1 1 auto;
`
