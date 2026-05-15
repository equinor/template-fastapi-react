import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { hasPermissionCheck } from '@/config/accessControl'
import { TodosPage, todoListQuery } from '@/features/todos'
import { userQuery } from '@/shared/platform/auth'

// Validate the `status` search param and provide a default value of 'all' if it's not present.
const searchSchema = z.object({
  status: z.enum(['all', 'active', 'done']).default('all'),
})

export const Route = createFileRoute('/todos')({
  beforeLoad: async ({ context: { queryClient } }) => {
    const user = await queryClient.ensureQueryData(userQuery())
    if (hasPermissionCheck(user, 'todos', 'read') !== true) {
      throw new Response(null, { status: 403 })
    }
  },
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(todoListQuery()),
  component: TodosPage,
  validateSearch: searchSchema,
})
