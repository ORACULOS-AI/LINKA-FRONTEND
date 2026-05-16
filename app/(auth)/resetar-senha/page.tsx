import { Suspense } from 'react'
import { ResetScreen } from './reset-screen'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ResetScreen />
    </Suspense>
  )
}
