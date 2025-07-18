import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import ModalTarea from '@/components/ModalTarea'
import TopNav from '@/components/TopNav'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

type Tarea = {
  id: string
  titulo: string
  completada: boolean
  created_at: string
  fecha_entrega?: string
  asignatura_id: string
}

type Asignatura = {
  id: string
  nombre: string
  color?: string
  tareas: Tarea[] // 👈 obligatorio, no opcional
}

export default function TareasPage() {
  const router = useRouter()
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([])
  const [cargando, setCargando] = useState(true)
  const [usuarioVerificado, setUsuarioVerificado] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [tareaEditando, setTareaEditando] = useState<Tarea | null>(null)

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

    const asignaturasConTareas: Asignatura[] = asignaturasData
      .map((a) => ({
        ...a,
        tareas: tareasData?.filter((t) => t.asignatura_id === a.id) || [],
      }))
      .filter((a) => a.tareas.length > 0) // ✅ solo asignaturas con tareas

    setAsignaturas(asignaturasConTareas)
    setCargando(false)
  }

  const cambiarEstado = async (id: string, completada: boolean) => {
    const { error } = await supabase.from('tareas').update({ completada }).eq('id', id)
    if (!error) await cargarAsignaturasYtareas()
  }

  const eliminarTarea = async (id: string) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })

    if (result.isConfirmed) {
      const { error } = await supabase.from('tareas').delete().eq('id', id)
      if (!error) {
        toast.success('Tarea eliminada', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
        },
      })
        await cargarAsignaturasYtareas()
      }
    }
  }

  if (!usuarioVerificado) {
    return <p className="p-4">Verificando sesión...</p>
  }

  

  return (
    <>
      <TopNav
      title="📝 Tareas"
      onAddClick={() => {
        setTareaEditando(null)
        setModalVisible(true)
      } } /> 
      <div className="container mt-4">
        {cargando ? (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : asignaturas.length === 0 ? (
          <p className="text-white text-center">No tienes tareas aún.</p>
        ) : (
          asignaturas.map((asignatura) => (
            <div
              key={asignatura.id}
              className="mb-4 p-4 rounded text-white"
              style={{
                backgroundColor: asignatura.color || '#343a40',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              }}
            >
              <h5 className="mb-3">{asignatura.nombre}</h5>

              {asignatura.tareas.map((tarea) => (
                <div key={tarea.id} className="d-flex justify-content-between align-items-start mb-2">
                  <div className="form-check">
                    <input
                      className="form-check-input me-2"
                      type="checkbox"
                      checked={tarea.completada}
                      onChange={(e) => cambiarEstado(tarea.id, e.target.checked)} />
                    <label
                      className={`form-check-label ${tarea.completada ? 'text-decoration-line-through text-muted' : ''}`}
                    >
                      {tarea.titulo}
                    </label>
                    {tarea.fecha_entrega && (
                      <div className="small mt-1 text-light">
                        📅 {new Date(tarea.fecha_entrega).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="ms-2">
                    <button
                      className="btn btn-secondary btn-sm me-2"
                      onClick={() => {
                        setTareaEditando(tarea)
                        setModalVisible(true)
                      } }
                    >
                      <FontAwesomeIcon icon="pencil" size="lg" />
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => eliminarTarea(tarea.id)}
                    >
                      <FontAwesomeIcon icon="trash" size="lg" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}

        <ModalTarea
          visible={modalVisible}
          tarea={tareaEditando
            ? {
              id: tareaEditando.id,
              titulo: tareaEditando.titulo,
              fecha_entrega: tareaEditando.fecha_entrega ?? '',
              asignatura_id: tareaEditando.asignatura_id,
            }
            : undefined}
          onClose={() => setModalVisible(false)}
          onSuccess={cargarAsignaturasYtareas} />
      </div>
    </>
  )
}
