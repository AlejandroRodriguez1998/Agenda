import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebaseClient'
import { COLOR_POR_DEFECTO, type Evento } from '@/lib/types'
import { confirmar, notifyError } from '@/lib/ui'
import Modal, { ColorPicker, Field } from './Modal'

type Props = {
  open: boolean
  onClose: () => void
  userId: string
  fechaPorDefecto: string
  evento: Evento | null
}

export default function ModalEvento({ open, onClose, userId, fechaPorDefecto, evento }: Props) {
  const [titulo, setTitulo] = useState('')
  const [fecha, setFecha] = useState('')
  const [color, setColor] = useState(COLOR_POR_DEFECTO)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!open) return
    setTitulo(evento?.title ?? '')
    setFecha(evento?.start ?? fechaPorDefecto)
    setColor(evento?.color ?? COLOR_POR_DEFECTO)
  }, [open, evento, fechaPorDefecto])

  const guardar = async () => {
    if (!titulo.trim()) return void toast.error('El título no puede estar vacío')
    if (!fecha) return void toast.error('Elige una fecha')

    setGuardando(true)
    try {
      const datos = { title: titulo.trim(), start: fecha, color }
      if (evento) {
        await updateDoc(doc(db, 'eventos', evento.id), datos)
        toast.success('Evento actualizado')
      } else {
        await addDoc(collection(db, 'eventos'), { ...datos, user_id: userId })
        toast.success('Evento creado')
      }
      onClose()
    } catch (err) {
      notifyError(err, 'No se pudo guardar el evento')
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async () => {
    if (!evento) return
    if (!(await confirmar({ title: '¿Eliminar evento?', text: evento.title }))) return
    try {
      await deleteDoc(doc(db, 'eventos', evento.id))
      toast.success('Evento eliminado')
      onClose()
    } catch (err) {
      notifyError(err, 'No se pudo eliminar el evento')
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={evento ? 'Editar evento' : 'Nuevo evento'}
      accent={color}
      onSubmit={guardar}
      footer={
        <>
          {evento && <button type="button" className="btn btn--danger-soft sheet__footer-start" onClick={eliminar}>Eliminar</button>}
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn--primary" disabled={guardando}>{evento ? 'Guardar' : 'Crear'}</button>
        </>
      }
    >
      <Field label="Título">
        <input className="input" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Examen de historia" maxLength={120} name="evento-titulo" autoComplete="off" autoCapitalize="sentences" enterKeyHint="done" />
      </Field>
      <Field label="Fecha">
        <input type="date" className="input" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </Field>
      <Field label="Color">
        <ColorPicker value={color} onChange={setColor} />
      </Field>
    </Modal>
  )
}
