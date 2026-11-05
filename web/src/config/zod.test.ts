import './zod'
import { z } from 'zod'
import { expect, test, vi } from 'vite-plus/test'

test('validates schemas without probing dynamic code under the production CSP', () => {
  const dynamicCode = vi.spyOn(globalThis, 'Function').mockImplementation(() => {
    throw new EvalError('CSP blocks dynamic code')
  })
  try {
    const schema = z.object({ name: z.string() })
    expect(schema.parse({ name: 'Hermes' })).toEqual({ name: 'Hermes' })
    expect(schema.safeParse({ name: 1 }).success).toBe(false)
    expect(dynamicCode).not.toHaveBeenCalled()
  } finally {
    dynamicCode.mockRestore()
  }
})
