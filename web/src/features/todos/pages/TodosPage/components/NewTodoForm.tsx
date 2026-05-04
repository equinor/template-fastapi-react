/**
 * Form for creating a new todo. Uses react-hook-form + Zod resolver per
 * the v7 §4 forms convention. Submission goes through `useCreateTodo`,
 * which is optimistic — the new row appears in the list before the
 * server confirms.
 */

import { Button, Input, Typography } from '@equinor/eds-core-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useCreateTodo } from '@/features/todos/api'
import { ErrorPanel } from '@/shared/components/ErrorPanel'

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Max 200 characters'),
})

type FormValues = z.infer<typeof schema>

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

  const onSubmit = handleSubmit(async ({ title }) => {
    await create.mutateAsync({ title })
    reset()
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-sm">
      <div className="flex gap-sm items-start">
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
