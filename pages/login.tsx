import { useEffect } from 'react'
import { useRouter } from 'next/router'
import AuthForm from '@/components/auth/AuthForm'
import SplashScreen from '@/components/SplashScreen'
import { safeNext, useAuth } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user) router.replace(safeNext(router.query.next))
  }, [user, router])

  if (user) return <SplashScreen />
  return <AuthForm />
}
