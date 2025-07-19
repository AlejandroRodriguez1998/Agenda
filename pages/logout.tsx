import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/router'

export default function LogoutPage() {
  const router = useRouter()
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const logout = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session?.user) {
        router.replace('/')
        return
      }

      await supabase.auth.signOut()
      router.replace('/login')
    }

    logout().finally(() => setCargando(false))
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
