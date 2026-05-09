import { z } from 'zod'
import { zAddTodoRequest } from '@/api-generated/zod.gen'

export const schema = z.object({
  title: z.string().trim().pipe(zAddTodoRequest.shape.title),
})

export type FormValues = z.infer<typeof schema>
