import { PageHeader } from '@/shared/components/PageHeader/PageHeader'

/**
 * Landing page. Intentionally minimal — replace with real content when
 * the home experience is designed. Kept as its own feature so cross-cutting
 * imports stay routed through `@/features/home` and remain consistent
 * with `@/features/todos`.
 */
export const HomePage = () => {
  return (
    <div className="flex flex-col gap-lg">
      <PageHeader title="Welcome" />
      <p>Template FastAPI + React is running.</p>
    </div>
  )
}
