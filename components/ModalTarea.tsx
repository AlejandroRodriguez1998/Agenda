import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebaseClient'
import { useData } from '@/lib/data'
import { addDays, toDateKey, todayKey } from '@/lib/dates'
import type { Tarea } from '@/lib/types'
import { confirmar, notifyError } from '@/lib/ui'
import Modal, { Field } from './Modal'
import SelectAsignatura from './SelectAsignatura'

type Props = {
  open: boolean
  onClose: () => void
  userId: string
  tarea?: Tarea | null
  asignaturaPorDefecto?: string
}

export default function ModalTarea({ open, onClose, userId, tarea, asignaturaPorDefecto }: Props) {
  const { asignaturasMap } = useData()
  const [titulo, setTitulo] = useState('')
  const [asignaturaId, setAsignaturaId] = useState('')
  const [fecha, setFecha] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!open) return
    setTitulo(tarea?.titulo ?? '')
    setAsignaturaId(tarea?.asignatura_id ?? asignaturaPorDefecto ?? '')
    setFecha(tarea?.fecha_entrega ?? '')
  }, [open, tarea, asignaturaPorDefecto])

  const guardar = async () => {
    if (!titulo.trim()) return void toast.error('Escribe un título')
    if (!asignaturaId) return void toast.error('Elige una asignatura')

    setGuardando(true)
    try {
      const datos = { titulo: titulo.trim(), fecha_entrega: fecha || null, asignatura_id: asignaturaId }
      if (tarea) {
        await updateDoc(doc(db, 'tareas', tarea.id), datos)
        toast.success('Tarea actualizada')
      } else {
        await addDoc(collection(db, 'tareas'), {
          ...datos,
          user_id: userId,
          completada: false,
          created_at: serverTimestamp(),
        })
        toast.success('Tarea añadida')
      }
      onClose()
    } catch (err) {
      notifyError(err, 'No se pudo guardar la tarea')
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async () => {
    if (!tarea) return
    if (!(await confirmar({ title: '¿Eliminar tarea?', text: tarea.titulo }))) return
    try {
      await deleteDoc(doc(db, 'tareas', tarea.id))
      toast.success('Tarea eliminada')
      onClose()
    } catch (err) {
      notifyError(err, 'No se pudo eliminar la tarea')
    }
  }

  const atajos = [
    { label: 'Hoy', value: todayKey() },
    { label: 'Mañana', value: toDateKey(addDays(new Date(), 1)) },
    { label: 'En 1 semana', value: toDateKey(addDays(new Date(), 7)) },
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tarea ? 'Editar tarea' : 'Nueva tarea'}
      accent={asignaturasMap.get(asignaturaId)?.color}
      onSubmit={guardar}
      footer={
        <>
          {tarea && <button type="button" className="btn btn--danger-soft sheet__footer-start" onClick={eliminar}>Eliminar</button>}
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn--primary" disabled={guardando}>
            {tarea ? 'Guardar' : 'Crear tarea'}
          </button>
        </>
      }
    >
      <Field label="Título">
        <input className="input" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Práctica 2 de redes" maxLength={140} name="tarea-titulo" autoComplete="off" autoCapitalize="sentences" enterKeyHint="done" />
      </Field>

      <Field label="Asignatura">
        <SelectAsignatura value={asignaturaId} onChange={setAsignaturaId} />
      </Field>

      <Field label="Fecha de entrega" hint="Opcional">
        <div className="chips chips--tight">
          {atajos.map((atajo) => (
            <button key={atajo.label} type="button" className={`chip ${fecha === atajo.value ? 'is-active' : ''}`} onClick={() => setFecha(atajo.value)}>
              {atajo.label}
            </button>
          ))}
          {fecha && (
            <button type="button" className="chip" onClick={() => setFecha('')}>Sin fecha</button>
          )}
        </div>
        <input type="date" className="input" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </Field>
    </Modal>
  )
}
