import { Suspense } from 'react'
import { VerifyEmailScreen } from './verify-screen'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailScreen />
    </Suspense>
  )
}
