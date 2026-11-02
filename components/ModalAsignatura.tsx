import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { addDoc, collection, doc, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore'
import { db } from '@/lib/firebaseClient'
import { COLOR_POR_DEFECTO, type Asignatura } from '@/lib/types'
import { useData } from '@/lib/data'
import { confirmar, notifyError } from '@/lib/ui'
import Modal, { ColorPicker, Field } from './Modal'

type Props = {
  open: boolean
  onClose: () => void
  userId: string
  asignatura?: Asignatura | null
  cursoPorDefecto?: number
}

export default function ModalAsignatura({ open, onClose, userId, asignatura, cursoPorDefecto = 1 }: Props) {
  const { tareas, horarios, notas } = useData()
  const [nombre, setNombre] = useState('')
  const [curso, setCurso] = useState(1)
  const [color, setColor] = useState(COLOR_POR_DEFECTO)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!open) return
    setNombre(asignatura?.nombre ?? '')
    setCurso(Number(asignatura?.curso) || cursoPorDefecto)
    setColor(asignatura?.color ?? COLOR_POR_DEFECTO)
  }, [open, asignatura, cursoPorDefecto])

  const guardar = async () => {
    if (!nombre.trim()) return void toast.error('Introduce un nombre')
    if (!Number.isInteger(curso) || curso < 1 || curso > 10) return void toast.error('El curso debe estar entre 1 y 10')

    setGuardando(true)
    try {
      const datos = { nombre: nombre.trim(), color, curso }
      if (asignatura) {
        await updateDoc(doc(db, 'asignaturas', asignatura.id), datos)
        toast.success('Asignatura actualizada')
      } else {
        await addDoc(collection(db, 'asignaturas'), { ...datos, user_id: userId, created_at: serverTimestamp() })
        toast.success('Asignatura añadida')
      }
      onClose()
    } catch (err) {
      notifyError(err, 'No se pudo guardar la asignatura')
    } finally {
      setGuardando(false)
    }
  }

  /** Borra la asignatura junto con sus tareas, clases y notas para no dejar huérfanos. */
  const eliminar = async () => {
    if (!asignatura) return
    const relacionados = [
      ...tareas.filter((t) => t.asignatura_id === asignatura.id).map((t) => doc(db, 'tareas', t.id)),
      ...horarios.filter((h) => h.asignatura_id === asignatura.id).map((h) => doc(db, 'horario', h.id)),
      ...notas.filter((n) => n.asignatura_id === asignatura.id).map((n) => doc(db, 'notas_academicas', n.id)),
    ]
    const detalle = [
      [tareas.filter((t) => t.asignatura_id === asignatura.id).length, 'tarea', 'tareas'],
      [horarios.filter((h) => h.asignatura_id === asignatura.id).length, 'clase', 'clases'],
      [notas.filter((n) => n.asignatura_id === asignatura.id).length, 'nota', 'notas'],
    ]
      .filter(([count]) => count)
      .map(([count, one, many]) => `${count} ${count === 1 ? one : many}`)
      .join(', ')

    const ok = await confirmar({
      title: `¿Eliminar ${asignatura.nombre}?`,
      text: detalle ? `También se eliminarán ${detalle}. No se puede deshacer.` : 'No se puede deshacer.',
    })
    if (!ok) return

    try {
      // Un batch admite hasta 500 operaciones.
      for (let i = 0; i < relacionados.length + 1; i += 450) {
        const batch = writeBatch(db)
        relacionados.slice(i, i + 450).forEach((ref) => batch.delete(ref))
        if (i + 450 >= relacionados.length + 1) batch.delete(doc(db, 'asignaturas', asignatura.id))
        await batch.commit()
      }
      toast.success('Asignatura eliminada')
      onClose()
    } catch (err) {
      notifyError(err, 'No se pudo eliminar la asignatura')
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={asignatura ? 'Editar asignatura' : 'Nueva asignatura'}
      accent={color}
      onSubmit={guardar}
      footer={
        <>
          {asignatura && <button type="button" className="btn btn--danger-soft sheet__footer-start" onClick={eliminar}>Eliminar</button>}
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn--primary" disabled={guardando}>
            {asignatura ? 'Guardar' : 'Añadir'}
          </button>
        </>
      }
    >
      <Field label="Nombre">
        <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Sistemas Distribuidos" maxLength={80} name="asignatura-nombre" autoComplete="off" autoCapitalize="sentences" enterKeyHint="done" />
      </Field>

      <Field label="Curso">
        <div className="stepper">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button key={n} type="button" className={curso === n ? 'is-active' : ''} onClick={() => setCurso(n)} aria-pressed={curso === n}>
              {n}º
            </button>
          ))}
        </div>
      </Field>

      <Field label="Color">
        <ColorPicker value={color} onChange={setColor} />
      </Field>
    </Modal>
  )
}
