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
  updateDoc,
  where,
} from 'firebase/firestore'

type Horario = {
  id: string
  asignatura_id: string
  tipo: 'teórica' | 'laboratorio'
  hora: string
  dias: string[]
}

type Props = {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
  userId: string
  horario?: Horario | null
}

type Asignatura = {
  id: string
  nombre: string
  curso: number
}

const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']

export default function ModalHorario({ visible, onClose, onSuccess, horario, userId }: Props) {
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([])
  const [asignaturaId, setAsignaturaId] = useState('')
  const [tipo, setTipo] = useState<'teórica' | 'laboratorio'>('teórica')
  const [hora, setHora] = useState('')
  const [dias, setDias] = useState<string[]>([])

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
    if (horario) {
      setAsignaturaId(horario.asignatura_id)
      setTipo(horario.tipo)
      setHora(horario.hora)
      setDias(horario.dias || [])
    } else {
      setAsignaturaId('')
      setTipo('teórica')
      setHora('')
      setDias([])
    }
  }, [horario])

  const asignaturasPorCurso = asignaturas.reduce((acc, a) => {
    if (!acc[a.curso]) acc[a.curso] = []
    acc[a.curso].push(a)
    return acc
  }, {} as Record<string, Asignatura[]>)

  const toggleDia = (dia: string) => {
    if (dias.includes(dia)) {
      setDias(dias.filter(d => d !== dia))
    } else {
      setDias([...dias, dia])
    }
  }

  const guardar = async () => {
    if (!asignaturaId || !hora || dias.length === 0) {
      toast.error('Rellena todos los campos', {
        style: { background: '#1a1a1a', color: '#fff' },
      })
      return
    }

    if (!userId) return

    const payload = {
      user_id: userId,
      asignatura_id: asignaturaId,
      tipo,
      hora,
      dias,
    }

    try {
      if (horario?.id) {
        await updateDoc(doc(db, 'horario', horario.id), payload)
      } else {
        await addDoc(collection(db, 'horario'), payload)
      }

      toast.success(horario?.id ? 'Horario actualizado' : 'Horario creado', {
        style: { background: '#1a1a1a', color: '#fff' },
      })
      onSuccess()
      onClose()
    } catch (err) {
      toast.error('Error al guardar', {
        style: { background: '#1a1a1a', color: '#fff' },
      })
    }
  }

  if (!visible) return null

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content bg-dark text-white">
          <div className="modal-body">
            <h4 className="text-center mb-3">
              {horario ? 'Editar horario' : 'Nuevo horario'}
            </h4>

            <div className="mb-3">
              <label className="form-label">Asignatura</label>
              <select
                className="form-select"
                value={asignaturaId}
                onChange={(e) => setAsignaturaId(e.target.value)}
              >
                <option value="">Selecciona una asignatura</option>
                {Object.entries(asignaturasPorCurso).map(([curso, lista]) => (
                  <optgroup key={curso} label={`${curso}º curso`}>
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
              <label className="form-label">Tipo de clase</label>
              <select
                className="form-select"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as 'teórica' | 'laboratorio')}
              >
                <option value="teórica">Teórica</option>
                <option value="laboratorio">Laboratorio</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Hora</label>
              <input
                type="time"
                className="form-control"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Días</label>
              <div className="d-flex gap-2 flex-wrap">
                {diasSemana.map((dia) => {
                  const abrev = dia.slice(0, 3).toUpperCase()
                  const activo = dias.includes(dia)
                  return (
                    <button
                      key={dia}
                      type="button"
                      onClick={() => toggleDia(dia)}
                      className={`btn btn-sm rounded-circle d-flex justify-content-center align-items-center ${
                        activo ? 'btn-primary' : 'btn-outline-secondary'
                      }`}
                      style={{
                        width: '40px',
                        height: '40px',
                        fontWeight: 'bold',
                        padding: 0,
                      }}
                    >
                      {abrev}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="d-flex justify-content-center gap-2 mt-4">
              <button className="btn btn-primary w-100" onClick={guardar}>
                {horario ? 'Guardar cambios' : 'Crear horario'}
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
