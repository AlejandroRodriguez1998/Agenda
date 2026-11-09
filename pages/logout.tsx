import { useEffect } from 'react'
import { useRouter } from 'next/router'
import SplashScreen from '@/components/SplashScreen'
import { cerrarSesion } from '@/lib/auth'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    cerrarSesion().finally(() => router.replace('/'))
  }, [router])

  return <SplashScreen />
}
