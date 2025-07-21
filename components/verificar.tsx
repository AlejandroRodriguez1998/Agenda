// pages/verificar.tsx
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Head from 'next/head'
import Link from 'next/link'

export default function VerificarPage() {
  const [verificando, setVerificando] = useState(true)
  const [estado, setEstado] = useState<'ok' | 'error' | null>(null)

  useEffect(() => {
    const verificar = async () => {
      // Obtener el código de la URL
      const url = new URL(window.location.href)
      const authCode = url.searchParams.get('code')

      let error = null
      if (authCode) {
        const result = await supabase.auth.exchangeCodeForSession(authCode)
        error = result.error
      } else {
        error = { message: 'No se encontró el código de verificación en la URL.' }
      }
      setVerificando(false)

      if (error) {
        setEstado('error')
      } else {
        setEstado('ok')
      }
    }

    verificar()
  }, [])

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

        {estado === 'ok' && (
          <>
            <h1 className="mb-3">✅ ¡Cuenta verificada!</h1>
            <p className="mb-4">Tu correo ha sido confirmado correctamente. Ya puedes iniciar sesión.</p>
            <Link href="/login" className="btn btn-primary">Ir a iniciar sesión</Link>
          </>
        )}

        {estado === 'error' && (
          <>
            <h1 className="mb-3">❌ Error al verificar</h1>
            <p className="mb-4">No se pudo confirmar tu correo. Intenta acceder desde el enlace de verificación otra vez.</p>
            <Link href="/" className="btn btn-outline-light">Volver al inicio</Link>
          </>
        )}
      </div>
    </>
  )
}
