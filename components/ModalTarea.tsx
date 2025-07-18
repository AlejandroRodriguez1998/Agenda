import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

type TareaModalProps = {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
  tarea?: {
    id: string
    titulo: string
    fecha_entrega: string
    asignatura_id: string
  }
}

export default function ModalTarea({ visible, onClose, onSuccess, tarea }: TareaModalProps) {
  const [asignaturas, setAsignaturas] = useState<{ id: string; nombre: string }[]>([])
  const [asignaturaId, setAsignaturaId] = useState(tarea?.asignatura_id || '')
  const [titulo, setTitulo] = useState(tarea?.titulo || '')
  const [fecha, setFecha] = useState(tarea?.fecha_entrega || '')

  useEffect(() => {
    supabase
      .from('asignaturas')
      .select('id, nombre')
      .then(({ data }) => {
        if (data) setAsignaturas(data)
      })
  }, [])

  useEffect(() => {
    if (tarea) {
      setAsignaturaId(tarea.asignatura_id)
      setTitulo(tarea.titulo)
      setFecha(tarea.fecha_entrega)
    } else {
      setAsignaturaId('')
      setTitulo('')
      setFecha('')
    }
  }, [tarea])

  const handleGuardar = async () => {
    if (!titulo.trim() || !asignaturaId) {
      toast.error('Rellena todos los campos', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
        },
      })
      return
    }

    const { data: session } = await supabase.auth.getSession()
    const userId = session.session?.user?.id
    if (!userId) return toast.error('No hay sesión activa', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
        },
      })

    const payload = {
      titulo: titulo.trim(),
      fecha_entrega: fecha,
      asignatura_id: asignaturaId,
      user_id: userId,
    }

    const { error } = tarea
      ? await supabase.from('tareas').update(payload).eq('id', tarea.id)
      : await supabase.from('tareas').insert(payload)

    if (error) {
      toast.error(error.message, {
        style: {
          background: '#1a1a1a',
          color: '#fff',
        },
      })
    } else {
      toast.success(tarea ? 'Tarea actualizada' : 'Tarea añadida', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
        },
      })
      setAsignaturaId('')
      setTitulo('')
      setFecha('')
      onSuccess()
      onClose()
    }
  }

  if (!visible) return null

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog modal-dialog-centered">
        <div className="modal-content bg-dark text-white">
          <div className="modal-body">
            <div className="text-center">
              <h3 className="mb-0">{tarea ? 'Editar Tarea' : 'Nueva Tarea'}</h3>
            </div>
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input className="form-control" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Asignatura</label>
              <select className="form-select" value={asignaturaId} onChange={(e) => setAsignaturaId(e.target.value)}>
                <option value="">Selecciona una</option>
                {asignaturas.map((a) => (
                  <option key={a.id} value={a.id}>{a.nombre}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Fecha de entrega</label>
              <input type="date" className="form-control" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </div>
            <div className="d-flex justify-content-center gap-2 mt-4">
              <button className="btn btn-primary" onClick={handleGuardar}>
                {tarea ? 'Guardar cambios' : 'Crear tarea'}
              </button>
              <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )
}
