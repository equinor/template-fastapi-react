import { Outlet } from '@tanstack/react-router'
import { Suspense } from 'react'
import { Header } from '@/app/layout/Header/Header'
import { FEATURE_FLAGS } from '@/config/featureFlags'
import { LoadingState } from '@/shared/components/LoadingState/LoadingState'
import { useCurrentUser } from '@/shared/platform/auth'
import { FeatureFlagsProvider } from '@/shared/platform/feature-flags'

export const RootLayout = () => {
  const { data: user } = useCurrentUser()
  return (
    <FeatureFlagsProvider flags={FEATURE_FLAGS} user={user}>
      <Header />
      <main className="max-w-[720px] mx-auto px-md py-xl">
        <Suspense fallback={<LoadingState variant="inline" label="Loading…" />}>
          <Outlet />
        </Suspense>
      </main>
    </FeatureFlagsProvider>
  )
}
