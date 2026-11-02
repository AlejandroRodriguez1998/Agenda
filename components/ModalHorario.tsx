import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebaseClient'
import { useData } from '@/lib/data'
import { DIAS_SEMANA, type Horario } from '@/lib/types'
import { confirmar, notifyError } from '@/lib/ui'
import Modal, { Field } from './Modal'
import SelectAsignatura from './SelectAsignatura'

type Props = {
  open: boolean
  onClose: () => void
  userId: string
  horario?: Horario | null
  diaPorDefecto?: string
}

const TIPOS = [
  { value: 'teórica', label: 'Teórica' },
  { value: 'laboratorio', label: 'Laboratorio' },
]

export default function ModalHorario({ open, onClose, userId, horario, diaPorDefecto }: Props) {
  const { asignaturasMap } = useData()
  const [asignaturaId, setAsignaturaId] = useState('')
  const [tipo, setTipo] = useState<string>('teórica')
  const [hora, setHora] = useState('')
  const [dias, setDias] = useState<string[]>([])
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!open) return
    setAsignaturaId(horario?.asignatura_id ?? '')
    setTipo(horario?.tipo ?? 'teórica')
    setHora(horario?.hora ?? '')
    setDias(horario?.dias ?? (diaPorDefecto ? [diaPorDefecto] : []))
  }, [open, horario, diaPorDefecto])

  const toggleDia = (dia: string) =>
    setDias((current) => (current.includes(dia) ? current.filter((d) => d !== dia) : [...current, dia]))

  const guardar = async () => {
    if (!asignaturaId) return void toast.error('Elige una asignatura')
    if (!hora) return void toast.error('Indica la hora')
    if (!dias.length) return void toast.error('Marca al menos un día')

    setGuardando(true)
    try {
      // Guardamos los días en orden de la semana.
      const datos = { asignatura_id: asignaturaId, tipo, hora, dias: DIAS_SEMANA.filter((d) => dias.includes(d)) }
      if (horario) {
        await updateDoc(doc(db, 'horario', horario.id), datos)
        toast.success('Clase actualizada')
      } else {
        await addDoc(collection(db, 'horario'), { ...datos, user_id: userId })
        toast.success('Clase añadida')
      }
      onClose()
    } catch (err) {
      notifyError(err, 'No se pudo guardar la clase')
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async () => {
    if (!horario) return
    if (!(await confirmar({ title: '¿Eliminar esta clase?', text: 'Se quitará de todos los días del horario.' }))) return
    try {
      await deleteDoc(doc(db, 'horario', horario.id))
      toast.success('Clase eliminada')
      onClose()
    } catch (err) {
      notifyError(err, 'No se pudo eliminar la clase')
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={horario ? 'Editar clase' : 'Nueva clase'}
      accent={asignaturasMap.get(asignaturaId)?.color}
      onSubmit={guardar}
      footer={
        <>
          {horario && <button type="button" className="btn btn--danger-soft sheet__footer-start" onClick={eliminar}>Eliminar</button>}
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn--primary" disabled={guardando}>
            {horario ? 'Guardar' : 'Añadir'}
          </button>
        </>
      }
    >
      <Field label="Asignatura">
        <SelectAsignatura value={asignaturaId} onChange={setAsignaturaId} />
      </Field>

      <div className="field-row">
        <Field label="Tipo">
          <div className="segmented segmented--full">
            {TIPOS.map((t) => (
              <button key={t.value} type="button" className={tipo === t.value ? 'is-active' : ''} onClick={() => setTipo(t.value)} aria-pressed={tipo === t.value}>
                {t.label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Hora de inicio">
          <input type="time" className="input" value={hora} onChange={(e) => setHora(e.target.value)} />
        </Field>
      </div>

      <Field label="Días">
        <div className="day-picker">
          {DIAS_SEMANA.map((dia) => (
            <button key={dia} type="button" className={dias.includes(dia) ? 'is-active' : ''} onClick={() => toggleDia(dia)} aria-pressed={dias.includes(dia)} aria-label={dia}>
              {dia === 'miércoles' ? 'X' : dia.charAt(0).toUpperCase()}
            </button>
          ))}
        </div>
      </Field>
    </Modal>
  )
}
