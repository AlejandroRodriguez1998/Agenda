import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { auth } from '@/lib/firebaseClient'
import AuthForm from '@/components/auth/AuthForm'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
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
