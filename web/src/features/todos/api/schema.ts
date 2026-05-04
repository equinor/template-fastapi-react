/**
 * Zod schemas for the todos feature. Validate at the network boundary —
 * not deeper — so a bad response (server change, proxy injecting HTML,
 * tests forgetting MSW) surfaces here with a clear path, instead of
 * crashing components reading `todo.is_completed` of undefined.
 */

import { z } from 'zod'

export const todoSchema = z.object({
  id: z.string(),
  title: z.string(),
  is_completed: z.boolean().optional().default(false),
})

export const todoListSchema = z.array(todoSchema)

export type Todo = z.infer<typeof todoSchema>
