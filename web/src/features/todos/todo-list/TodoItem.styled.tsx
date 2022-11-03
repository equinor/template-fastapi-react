import styled from 'styled-components'
import { Typography } from '@equinor/eds-core-react'

export const StyledTodoItemTitle = styled(Typography)`
  text-decoration: ${(props: { is_completed?: boolean }) =>
    props.is_completed ? 'line-through' : 'none'};
`
