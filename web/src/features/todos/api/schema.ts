/**
 * Domain types and runtime validators for the todos feature, sourced
 * from the generated SDK so a server-side schema change surfaces here
 * at compile time (TS) and at runtime (Zod) instead of crashing
 * components reading `todo.is_completed` of undefined.
 *
 * Re-exporting from `@/api-generated/zod.gen` keeps a single feature-
 * level boundary file: components and hooks import `Todo` from here,
 * never directly from `api-generated`.
 */

import type { z } from 'zod'
import { zGetTodoAllResponse } from '@/api-generated/zod.gen'

export const todoSchema = zGetTodoAllResponse
export const todoListSchema = zGetTodoAllResponse.array()

export type Todo = z.infer<typeof todoSchema>
