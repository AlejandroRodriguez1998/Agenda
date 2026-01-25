import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebaseClient'
import { useRouter } from 'next/router'
import { onAuthStateChanged, signOut } from 'firebase/auth'

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

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      {cargando ? (
        <div className="spinner-border text-primary" role="status" />
      ) : (
        <p className="text-white">Redirigiendo...</p>
      )}
    </div>
  )
}
