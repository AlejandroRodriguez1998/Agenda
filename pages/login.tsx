import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { auth } from '@/lib/firebaseClient'
import AuthForm from '@/components/auth/AuthForm'
import SplashScreen from '@/components/SplashScreen'
import { onAuthStateChanged } from 'firebase/auth'

export default function LoginPage() {
  const router = useRouter()
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/')
      } else {
        setCargando(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  if (cargando) {
    return <SplashScreen />
  }

  return <AuthForm />
}
