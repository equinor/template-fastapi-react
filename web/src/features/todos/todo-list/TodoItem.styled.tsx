import { Typography } from '@equinor/eds-core-react'
import styled from 'styled-components'

export const StyledTodoItemTitle = styled(Typography)`
  text-decoration: ${(props: { isStruckThrough?: boolean }) => (props.isStruckThrough ? 'line-through' : 'none')};
`
