import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'

type Asignatura = {
  id: string
  nombre: string
  color?: string
}

export default function AsignaturasPage() {
  const router = useRouter()
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([])
  const [nombre, setNombre] = useState('')
  const [color, setColor] = useState('#007bff')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session?.user) {
        router.push('/login')
        return
      }

      await cargarAsignaturas()
    }

    cargar()
  }, [router])

  const cargarAsignaturas = async () => {
    setCargando(true)
    const { data, error } = await supabase
      .from('asignaturas')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) setAsignaturas(data)
    setCargando(false)
  }

  const añadirAsignatura = async () => {
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData.session?.user?.id
    if (!nombre.trim() || !userId) return

    const { error } = await supabase
      .from('asignaturas')
      .insert({ nombre: nombre.trim(), color, user_id: userId })

    if (!error) {
      setNombre('')
      await cargarAsignaturas()
    }
  }

  const eliminarAsignatura = async (id: string) => {
    const { error } = await supabase.from('asignaturas').delete().eq('id', id)
    if (!error) await cargarAsignaturas()
  }

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">📚 Asignaturas</h2>

      <div className="row mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Nombre de la asignatura"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <input
            type="color"
            className="form-control form-control-color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            title="Color"
          />
        </div>
        <div className="col-md-3">
          <button className="btn btn-primary w-100" onClick={añadirAsignatura}>
            Añadir
          </button>
        </div>
      </div>

      {cargando ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : asignaturas.length === 0 ? (
        <p className="text-muted text-center">No tienes asignaturas.</p>
      ) : (
        <ul className="list-group">
          {asignaturas.map((a) => (
            <li
              key={a.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <span>
                <span
                  className="me-2 d-inline-block rounded-circle"
                  style={{
                    width: 12,
                    height: 12,
                    backgroundColor: a.color || '#ccc',
                  }}
                ></span>
                {a.nombre}
              </span>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => eliminarAsignatura(a.id)}
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
