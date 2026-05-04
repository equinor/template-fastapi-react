/**
 * The only place this feature imports `@/api-generated`. Components and
 * hooks call `todosApi.list()` etc. — they don't know which SDK
 * implements them. Swap REST → GraphQL → MSW by editing this file alone.
 *
 * Each function:
 *   - Calls the generated SDK with `throwOnError: true` so failures bubble
 *     up as `ApiError` (thanks to `httpClient`).
 *   - Validates the response with Zod and returns the parsed domain type.
 */

import {
  createTodo as sdkCreate,
  deleteTodoById as sdkDelete,
  getAllTodos as sdkList,
  updateTodoById as sdkUpdate,
} from '@/api-generated'
import { type Todo, todoListSchema, todoSchema } from './schema'

export const todosApi = {
  list: async (): Promise<Todo[]> => {
    const { data } = await sdkList({ throwOnError: true })
    return todoListSchema.parse(data)
  },

  create: async (input: { title: string }): Promise<Todo> => {
    const { data } = await sdkCreate({
      body: { title: input.title },
      throwOnError: true,
    })
    return todoSchema.parse(data)
  },

  update: async (id: string, patch: { title: string; is_completed: boolean }): Promise<void> => {
    await sdkUpdate({ path: { id }, body: patch, throwOnError: true })
  },

  remove: async (id: string): Promise<void> => {
    await sdkDelete({ path: { id }, throwOnError: true })
  },
}
