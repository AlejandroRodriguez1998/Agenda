import { useEffect, useState } from 'react'
import { db } from '@/lib/firebaseClient'
import toast from 'react-hot-toast'
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'

type TareaModalProps = {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
  userId: string
  tarea?: {
    id: string
    titulo: string
    fecha_entrega: string
    asignatura_id: string
  }
}

type Asignatura = {
  id: string
  nombre: string
  curso: number
}

export default function ModalTarea({ visible, onClose, onSuccess, tarea, userId }: TareaModalProps) {
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([])
  const [asignaturaId, setAsignaturaId] = useState(tarea?.asignatura_id || '')
  const [titulo, setTitulo] = useState(tarea?.titulo || '')
  const [fecha, setFecha] = useState(tarea?.fecha_entrega || '')

  useEffect(() => {
    const cargarAsignaturas = async () => {
      if (!userId) return
      const q = query(
        collection(db, 'asignaturas'),
        where('user_id', '==', userId),
        orderBy('curso'),
        orderBy('nombre')
      )
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Asignatura, 'id'>),
      }))
      setAsignaturas(data)
    }

    cargarAsignaturas()
  }, [userId])

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

    if (!userId) {
      return toast.error('No hay sesión activa', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
        },
      })
    }

    const payload = {
      titulo: titulo.trim(),
      fecha_entrega: fecha || null,
      asignatura_id: asignaturaId,
      user_id: userId,
    }

    try {
      if (tarea) {
        await updateDoc(doc(db, 'tareas', tarea.id), payload)
      } else {
        await addDoc(collection(db, 'tareas'), {
          ...payload,
          completada: false,
          created_at: serverTimestamp(),
        })
      }

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
    } catch (err) {
      const firebaseError = err as { message?: string }
      toast.error(firebaseError.message || 'Error al guardar tarea', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
        },
      })
    }
  }

  if (!visible) return null

  // Agrupamos por curso
  const asignaturasPorCurso = asignaturas.reduce((acc, a) => {
    if (!acc[a.curso]) acc[a.curso] = []
    acc[a.curso].push(a)
    return acc
  }, {} as Record<string, Asignatura[]>)

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
              <input
                className="form-control"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Asignatura</label>
              <select
                className="form-select"
                value={asignaturaId}
                onChange={(e) => setAsignaturaId(e.target.value)}
              >
                <option value="">Selecciona una asignatura</option>
                {Object.entries(asignaturasPorCurso).map(([curso, lista]) => (
                  <optgroup key={curso} label={`${curso}ª curso`}>
                    {lista.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nombre}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Fecha de entrega</label>
              <input
                type="date"
                className="form-control"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>

            <div className="d-flex justify-content-center gap-2 mt-4">
              <button className="btn btn-primary w-100" onClick={handleGuardar}>
                {tarea ? 'Guardar cambios' : 'Crear tarea'}
              </button>
              <button className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
