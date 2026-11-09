import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faCircleExclamation, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { applyActionCode } from 'firebase/auth'
import { auth } from '@/lib/firebaseClient'
import { useAuth } from '@/lib/auth'

type Estado = 'verificando' | 'ok' | 'error'

export default function VerificarPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [estado, setEstado] = useState<Estado>('verificando')
  const started = useRef(false)

  // Se aplica el código siempre, haya sesión o no: tras registrarse el usuario
  // ya tiene sesión abierta y antes se le redirigía sin verificar el correo.
  useEffect(() => {
    if (!router.isReady || started.current) return
    started.current = true
    const oobCode = typeof router.query.oobCode === 'string' ? router.query.oobCode : null
    if (!oobCode) return setEstado('error')

    applyActionCode(auth, oobCode)
      .then(async () => {
        await auth.currentUser?.reload().catch(() => {})
        setEstado('ok')
      })
      .catch(() => setEstado('error'))
  }, [router.isReady, router.query.oobCode])

  const contenido = {
    verificando: { icon: faSpinner, title: 'Verificando tu correo…', text: 'Un momento, estamos confirmando tu cuenta.' },
    ok: { icon: faCircleCheck, title: 'Cuenta verificada', text: 'Tu correo ha sido confirmado correctamente.' },
    error: { icon: faCircleExclamation, title: 'No se pudo verificar', text: 'El enlace no es válido o ha caducado. Vuelve a abrirlo desde el último correo recibido.' },
  }[estado]

  return (
    <>
      <Head>
        <title>Verificación · Agenda</title>
      </Head>
      <main className="center-screen">
        <div className={`status-card status-card--${estado}`}>
          <span className="status-card__icon"><FontAwesomeIcon icon={contenido.icon} spin={estado === 'verificando'} /></span>
          <h1>{contenido.title}</h1>
          <p>{contenido.text}</p>
          {estado !== 'verificando' && (
            <Link href={user ? '/' : '/login'} className="btn btn--primary btn--block">
              {user ? 'Ir a mi agenda' : 'Iniciar sesión'}
            </Link>
          )}
        </div>
      </main>
    </>
  )
}
