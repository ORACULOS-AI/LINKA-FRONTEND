import { Suspense } from 'react'
import { AuthScreen } from './auth-screen'

export default function EntrarPage() {
  return (
    <Suspense fallback={null}>
      <AuthScreen />
    </Suspense>
  )
}
