// pages/verificar.tsx
import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebaseClient'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { applyActionCode, onAuthStateChanged } from 'firebase/auth'

export default function VerificarPage() {
  const router = useRouter()
  const [verificando, setVerificando] = useState(true)
  const [estado, setEstado] = useState<'ok' | 'error' | null>(null)

  useEffect(() => {
    const verificar = async () => {
      const url = new URL(window.location.href)
      const oobCode = url.searchParams.get('oobCode')

      let error = null
      if (oobCode) {
        try {
          await applyActionCode(auth, oobCode)
        } catch (err) {
          error = err
        }
      } else {
        error = { message: 'No se encontró el código de verificación en la URL.' }
      }

      setVerificando(false)
      setEstado(error ? 'error' : 'ok')
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/')
        return
      }

      verificar()
    })

    return () => unsubscribe()
  }, [router])

  return (
    <>
      <Head>
        <title>Verificación de cuenta</title>
      </Head>

      <div className="container text-white text-center py-5">
        {verificando && (
          <>
            <h1 className="mb-3">🔄 Verificando cuenta...</h1>
            <p>Estamos confirmando tu correo electrónico.</p>
          </>
        )}

        {estado === 'error' && (
          <>
            <h1 className="mb-3">❌ Error al verificar</h1>
            <p className="mb-4">No se pudo confirmar tu correo. Intenta acceder desde el enlace de verificación otra vez.</p>
            <Link href="/" className="btn btn-outline-light">Volver al inicio</Link>
          </>
        )}

        {estado === 'ok' && (
          <>
            <h1 className="mb-3">✅ Cuenta verificada</h1>
            <p className="mb-4">Tu correo ha sido confirmado. Ya puedes iniciar sesión.</p>
            <Link href="/login" className="btn btn-outline-light">Ir a iniciar sesión</Link>
          </>
        )}
      </div>
    </>
  )
}
