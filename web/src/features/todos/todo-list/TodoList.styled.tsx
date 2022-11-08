import styled from 'styled-components'

export const StyledTodoList = styled.div`
  width: 400px;
  padding: 30px;
  position: relative;
`

export const SpinnerContainer = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.4);
`

export const StyledInput = styled.div`
  display: flex;

  .input {
    margin-right: 5px;
  }
`
