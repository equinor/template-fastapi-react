/**
 * Form for creating a new todo. Uses react-hook-form + Zod resolver per
 * the v7 §4 forms convention. Submission goes through `useCreateTodo`,
 * which is optimistic — the new row appears in the list before the
 * server confirms.
 *
 * Validation reuses the OpenAPI-generated `zAddTodoRequest` schema as
 * the single source of truth for field constraints (length, required-
 * ness), so the client cannot drift from the server contract. A leading/
 * trailing-whitespace trim is layered on via a `pipe` so a string of
 * spaces fails `min(1)` rather than reaching the API.
 */

import { Button, Input, Typography } from '@equinor/eds-core-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useCreateTodo } from '@/features/todos/api'
import { ErrorPanel } from '@team-hermes/react-components'
import { type FormValues, schema } from './NewTodoForm.utils'

export const NewTodoForm = () => {
  const create = useCreateTodo()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '' },
  })

  const onSubmit = handleSubmit(({ title }) => {
    create.mutate({ body: { title } }, { onSuccess: () => reset() })
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-2">
      <div className="flex gap-2 items-start">
        <Input
          {...register('title')}
          className="flex-1"
          placeholder="Add Task"
          aria-invalid={errors.title ? 'true' : 'false'}
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
        <Button type="submit" disabled={isSubmitting || create.isPending}>
          Add
        </Button>
      </div>
      {errors.title && (
        <Typography id="title-error" variant="caption" color="danger">
          {errors.title.message}
        </Typography>
      )}
      {create.error && <ErrorPanel error={create.error} />}
    </form>
  )
}
