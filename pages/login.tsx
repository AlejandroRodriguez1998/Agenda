import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import AuthForm from '@/components/auth/AuthForm'

export default function LoginPage() {
  const router = useRouter()
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const comprobarSesion = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session?.user) {
        router.replace('/')
      } else {
        setCargando(false)
      }
    }

    comprobarSesion()
  }, [router])

  if (cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status" />
      </div>
    )
  }

  return (
    <div className="p-4">
      <AuthForm />
    </div>
  )
}
