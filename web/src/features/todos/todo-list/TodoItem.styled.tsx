import styled from 'styled-components'
import { Typography } from '@equinor/eds-core-react'

export const StyledTodoItemTitle = styled(Typography)`
  text-decoration: ${(props: { isStruckThrough?: boolean }) =>
    props.isStruckThrough ? 'line-through' : 'none'};
`
