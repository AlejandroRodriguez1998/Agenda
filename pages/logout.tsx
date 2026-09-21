import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebaseClient'
import { useRouter } from 'next/router'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import SplashScreen from '@/components/SplashScreen'

export default function LogoutPage() {
  const router = useRouter()
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/')
        setCargando(false)
        return
      }

      await signOut(auth)
      router.replace('/login')
      setCargando(false)
    })

    return () => unsubscribe()
  }, [router])

  return cargando ? <SplashScreen /> : <p className="app-state">Redirigiendo...</p>
}
