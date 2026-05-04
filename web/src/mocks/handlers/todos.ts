/**
 * MSW handlers covering the same routes the generated SDK calls. Match
 * against the absolute URL with the test baseUrl (`http://localhost`)
 * so tests don't depend on Vite proxy.
 */

import { HttpResponse, http } from 'msw'
import type { AddTodoResponse } from '../../api-generated'
import { db } from '../db'

const base = 'http://localhost'

export const todosHandlers = [
  http.get(`${base}/todos`, () => HttpResponse.json(db.todos)),

  http.post(`${base}/todos`, async ({ request }) => {
    const body = (await request.json()) as { title: string }
    const todo: AddTodoResponse = {
      id: crypto.randomUUID(),
      title: body.title,
      is_completed: false,
    }
    db.todos = [...db.todos, todo]
    return HttpResponse.json(todo, { status: 200 })
  }),

  http.put(`${base}/todos/:id`, async ({ params, request }) => {
    const id = params.id as string
    const body = (await request.json()) as {
      title?: string
      is_completed?: boolean
    }
    const idx = db.todos.findIndex((t) => t.id === id)
    if (idx === -1) {
      return HttpResponse.json({ message: 'not found' }, { status: 404 })
    }
    const updated: AddTodoResponse = {
      ...db.todos[idx],
      title: body.title ?? db.todos[idx].title,
      is_completed: body.is_completed ?? db.todos[idx].is_completed,
    }
    db.todos = [...db.todos.slice(0, idx), updated, ...db.todos.slice(idx + 1)]
    return HttpResponse.json(updated)
  }),

  http.delete(`${base}/todos/:id`, ({ params }) => {
    const id = params.id as string
    db.todos = db.todos.filter((t) => t.id !== id)
    return new HttpResponse(null, { status: 204 })
  }),
]
