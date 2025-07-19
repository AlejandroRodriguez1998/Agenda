import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import AuthForm from '@/components/auth/AuthForm'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'

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
    <div className="position-relative p-4">
      {/* Botón arriba a la derecha */}
      <button
        className="btn btn-outline-light position-absolute"
        style={{ top: -41, right: 20 }}
        onClick={() => router.push('/')}
      >
        <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
        Volver
      </button>

      <AuthForm />
    </div>
  )
}
