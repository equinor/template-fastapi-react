import { Typography } from '@equinor/eds-core-react'
import styled from 'styled-components'

export const StyledTodoItemTitle = styled(Typography)<{ $isStruckThrough?: boolean }>`
  text-decoration: ${(props) => (props.$isStruckThrough ? 'line-through' : 'none')};
`
