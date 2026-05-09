import { afterEach, describe, expect, it, vi } from 'vitest'
import { toast, toastStore } from './toastStore'

describe('toastStore', () => {
  afterEach(() => {
    toastStore._reset()
  })

  it('appends a toast and notifies subscribers', () => {
    const listener = vi.fn()
    const unsubscribe = toastStore.subscribe(listener)

    const id = toast.success('It worked')

    expect(listener).toHaveBeenCalledTimes(1)
    const snapshot = toastStore.getSnapshot()
    expect(snapshot).toHaveLength(1)
    expect(snapshot[0]).toMatchObject({
      id,
      variant: 'success',
      message: 'It worked',
    })

    unsubscribe()
  })

  it('uses a longer auto-hide for errors than for success', () => {
    toast.success('s')
    toast.error('e')
    const [success, error] = toastStore.getSnapshot()
    expect(error.autoHideMs).toBeGreaterThan(success.autoHideMs)
  })

  it('dismiss removes the matching toast and emits', () => {
    const id = toast.info('hi')
    const listener = vi.fn()
    toastStore.subscribe(listener)

    toastStore.dismiss(id)

    expect(toastStore.getSnapshot()).toHaveLength(0)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('dismiss is a no-op for an unknown id', () => {
    toast.info('hi')
    const listener = vi.fn()
    toastStore.subscribe(listener)

    toastStore.dismiss(9999)

    expect(toastStore.getSnapshot()).toHaveLength(1)
    expect(listener).not.toHaveBeenCalled()
  })
})
