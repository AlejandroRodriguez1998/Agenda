import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebaseClient'
import type { Nota } from '@/lib/types'
import { notifyError } from '@/lib/ui'
import Modal, { Field } from './Modal'

type Props = {
  open: boolean
  asignaturaId: string
  asignaturaNombre?: string
  userId: string
  nota?: Nota | null
  /** Peso que queda por asignar (100 - suma actual), para sugerirlo. */
  pesoRestante?: number
  onClose: () => void
}

const SUGERENCIAS = ['Examen parcial', 'Examen final', 'Práctica', 'Trabajo', 'Participación']

const parseNumero = (value: string) => Number.parseFloat(value.replace(',', '.'))

export default function ModalNota({ open, asignaturaId, asignaturaNombre, userId, nota, pesoRestante, onClose }: Props) {
  const [tipo, setTipo] = useState('')
  const [valor, setValor] = useState('')
  const [peso, setPeso] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!open) return
    setTipo(nota?.tipo ?? '')
    setValor(nota ? String(nota.nota) : '')
    setPeso(nota ? String(nota.peso) : pesoRestante && pesoRestante > 0 ? String(pesoRestante) : '')
  }, [open, nota, pesoRestante])

  const guardar = async () => {
    const numero = parseNumero(valor)
    const pesoNumero = parseNumero(peso)
    if (!tipo.trim()) return void toast.error('Indica qué se evalúa')
    if (!Number.isFinite(numero) || numero < 0 || numero > 10) return void toast.error('La nota debe estar entre 0 y 10')
    if (!Number.isFinite(pesoNumero) || pesoNumero <= 0 || pesoNumero > 100) return void toast.error('El peso debe estar entre 1 y 100')

    setGuardando(true)
    try {
      const datos = { tipo: tipo.trim(), nota: numero, peso: pesoNumero }
      if (nota) {
        await updateDoc(doc(db, 'notas_academicas', nota.id), datos)
        toast.success('Nota actualizada')
      } else {
        await addDoc(collection(db, 'notas_academicas'), {
          ...datos,
          user_id: userId,
          asignatura_id: asignaturaId,
          created_at: serverTimestamp(),
        })
        toast.success('Nota añadida')
      }
      onClose()
    } catch (err) {
      notifyError(err, 'No se pudo guardar la nota')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={nota ? 'Editar nota' : 'Añadir nota'}
      subtitle={asignaturaNombre}
      onSubmit={guardar}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn--primary" disabled={guardando}>{nota ? 'Guardar' : 'Añadir'}</button>
        </>
      }
    >
      <Field label="Evaluación">
        <input className="input" value={tipo} onChange={(e) => setTipo(e.target.value)} placeholder="Ej: Examen parcial" maxLength={80} list="tipos-nota" />
        <datalist id="tipos-nota">
          {SUGERENCIAS.map((s) => <option key={s} value={s} />)}
        </datalist>
      </Field>
      <div className="field-row">
        <Field label="Nota (0–10)">
          <input className="input" inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="7,5" />
        </Field>
        <Field label="Peso (%)" hint={pesoRestante !== undefined && !nota ? `Quedan ${Math.max(0, pesoRestante)}%` : undefined}>
          <input className="input" inputMode="decimal" value={peso} onChange={(e) => setPeso(e.target.value)} placeholder="30" />
        </Field>
      </div>
    </Modal>
  )
}
