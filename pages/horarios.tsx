import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/router'

export default function CrearHorario() {
  const [titulo, setTitulo] = useState('')
  const [fechaLocal, setFechaLocal] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState('')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user
      if (user) {
        setUserId(user.id)
      } else {
        router.push('/login')
      }
    })
  }, [])

  const crearHorario = async () => {
    if (!titulo || !fechaLocal || !userId) {
      setMensaje('Rellena todos los campos')
      return
    }

    // Convertir la fecha local del input a UTC ISO string
    const localDate = new Date(fechaLocal)
    const fechaUTC = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000).toISOString()

    const { error } = await supabase.from('horario').insert([
      {
        user_id: userId,
        titulo,
        descripcion: '',
        fecha: fechaUTC,
      },
    ])

    if (error) {
      console.error('Error al crear horario:', error)
      setMensaje('❌ Error al crear horario')
    } else {
      setMensaje('✅ Horario creado correctamente')
      setTitulo('')
      setFechaLocal('')
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: 20 }}>
      <h2>Crear nuevo horario</h2>

      <div className="mb-3">
        <label className="form-label">Título</label>
        <input
          type="text"
          className="form-control"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Fecha y hora</label>
        <input
          type="datetime-local"
          className="form-control"
          value={fechaLocal}
          onChange={(e) => setFechaLocal(e.target.value)}
        />
      </div>

      <button className="btn btn-primary" onClick={crearHorario}>
        Guardar horario
      </button>

      {mensaje && <div className="mt-3 alert alert-info">{mensaje}</div>}
    </div>
  )
}
