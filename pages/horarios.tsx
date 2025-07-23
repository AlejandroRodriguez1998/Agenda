import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { setupPushNotifications } from '@/lib/setupPush'

export default function HorariosPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    const obtenerUsuario = async () => {
      if (typeof window === 'undefined' || !('Notification' in window)) return

      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token || null

      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id || null

      console.log('🔐 Usuario ID:', uid)
      console.log('🔑 Access token:', accessToken)

      if (accessToken && uid) {
        setToken(accessToken)
        setUserId(uid)
        await setupPushNotifications(uid)
      }
    }

    obtenerUsuario()
  }, [])

  const enviarNotificacion = async () => {
    if (!userId) {
      alert('Usuario no identificado')
      return
    }

    setEnviando(true)

    const payload = {
      userId,
      title: '📚 ¡Prueba de notificación!',
      body: 'Esto es una notificación de ejemplo para los horarios.',
    }

    console.log('📦 Enviando payload:', payload)

    try {
      const res = await fetch('https://tfnbyjiuoklehdaorlsi.supabase.co/functions/v1/notificar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      })

      const msg = await res.text()

      if (res.ok) {
        alert('✅ Notificación enviada correctamente')
      } else {
        alert('❌ Error: ' + msg)
      }
    } catch (error) {
      alert('❌ Error al enviar la notificación: ' + (error instanceof Error ? error.message : String(error)))
    }

    setEnviando(false)
  }

  return (
    <div className="container mt-5">
      <h2>Horarios</h2>
      <p>Haz clic en el botón para enviar una notificación de prueba.</p>
      <button className="btn btn-primary" onClick={enviarNotificacion} disabled={enviando}>
        {enviando ? 'Enviando...' : 'Enviar notificación'}
      </button>
    </div>
  )
}
