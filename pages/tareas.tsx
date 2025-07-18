import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'

type Tarea = {
  id: string
  titulo: string
  completada: boolean
  created_at: string
  asignatura_id: string
}

type Asignatura = {
  id: string
  nombre: string
  tareas?: Tarea[]
}

export default function TareasPage() {
  const router = useRouter()
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([])
  const [nuevasTareas, setNuevasTareas] = useState<Record<string, string>>({})
  const [cargando, setCargando] = useState(true)
  const [usuarioVerificado, setUsuarioVerificado] = useState(false)

  useEffect(() => {
    const verificarSesion = async () => {
      const { data } = await supabase.auth.getSession()
      const user = data.session?.user

      if (!user) {
        router.replace('/login')
      } else {
        setUsuarioVerificado(true)
        await cargarAsignaturasYtareas()
      }
    }

    verificarSesion()
  }, [router])

  const cargarAsignaturasYtareas = async () => {
    setCargando(true)

    const { data: asignaturasData } = await supabase
      .from('asignaturas')
      .select('*')
      .order('nombre')

    if (!asignaturasData) return

    const { data: tareasData } = await supabase
      .from('tareas')
      .select('*')
      .order('created_at', { ascending: false })

    const asignaturasConTareas = asignaturasData.map((a) => ({
      ...a,
      tareas: tareasData?.filter((t) => t.asignatura_id === a.id) || [],
    }))

    setAsignaturas(asignaturasConTareas)
    setCargando(false)
  }

  const añadirTarea = async (asignaturaId: string) => {
    const titulo = nuevasTareas[asignaturaId]?.trim()
    if (!titulo) return

    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData.session?.user?.id
    if (!userId) return alert('❌ No hay sesión activa')

    const { error } = await supabase.from('tareas').insert({
      titulo,
      user_id: userId,
      asignatura_id: asignaturaId,
    })

    if (!error) {
      setNuevasTareas((prev) => ({ ...prev, [asignaturaId]: '' }))
      await cargarAsignaturasYtareas()
    }
  }

  const cambiarEstado = async (id: string, completada: boolean) => {
    const { error } = await supabase.from('tareas').update({ completada }).eq('id', id)
    if (!error) await cargarAsignaturasYtareas()
  }

  const eliminarTarea = async (id: string) => {
    const { error } = await supabase.from('tareas').delete().eq('id', id)
    if (!error) await cargarAsignaturasYtareas()
  }

  if (!usuarioVerificado) {
    return <p className="p-4">Verificando sesión...</p>
  }

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">📝 Tareas por asignatura</h1>

      {cargando ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : asignaturas.length === 0 ? (
        <p className="text-muted text-center">No tienes asignaturas aún.</p>
      ) : (
        asignaturas.map((asignatura) => (
          <div key={asignatura.id} className="mb-5">
            <h5>{asignatura.nombre}</h5>

            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Nueva tarea..."
                value={nuevasTareas[asignatura.id] || ''}
                onChange={(e) =>
                  setNuevasTareas((prev) => ({
                    ...prev,
                    [asignatura.id]: e.target.value,
                  }))
                }
              />
              <button
                className="btn btn-primary"
                onClick={() => añadirTarea(asignatura.id)}
              >
                Añadir
              </button>
            </div>

            {asignatura.tareas?.length === 0 ? (
              <p className="text-muted">Sin tareas aún.</p>
            ) : (
              <ul className="list-group">
                {asignatura.tareas?.map((tarea) => (
                  <li
                    key={tarea.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div className="form-check">
                      <input
                        className="form-check-input me-2"
                        type="checkbox"
                        checked={tarea.completada}
                        onChange={(e) => cambiarEstado(tarea.id, e.target.checked)}
                      />
                      <label
                        className={`form-check-label ${
                          tarea.completada ? 'text-decoration-line-through text-muted' : ''
                        }`}
                      >
                        {tarea.titulo}
                      </label>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => eliminarTarea(tarea.id)}
                    >
                      🗑️
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))
      )}
    </div>
  )
}
