import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { setupPushNotifications } from '@/lib/setupPush' // asegúrate de tener esto creado

export default function HorariosPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    const obtenerUsuario = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token || null
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id || null

      if (accessToken && uid) {
        setToken(accessToken)
        setUserId(uid)

        // Pedimos permiso y guardamos token push en supabase
        await setupPushNotifications(uid)
      }
    }

    obtenerUsuario()
  }, [])

  const enviarNotificacion = async () => {
    if (!userId) return alert('Usuario no identificado')
    setEnviando(true)

    const res = await fetch('https://<TU_PROYECTO>.functions.supabase.co/notificar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }), // solo si no es pública
      },
      body: JSON.stringify({
        userId,
        title: '📚 ¡Prueba de notificación!',
        body: 'Esto es una notificación de ejemplo para los horarios.',
      }),
    })

    if (res.ok) {
      alert('✅ Notificación enviada correctamente')
    } else {
      const msg = await res.text()
      alert('❌ Error: ' + msg)
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
