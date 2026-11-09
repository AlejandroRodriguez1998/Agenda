import Link from 'next/link'
import { useData } from '@/lib/data'
import type { Asignatura } from '@/lib/types'

/** Selector de asignatura agrupado por curso. */
export default function SelectAsignatura({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const { asignaturas } = useData()

  if (!asignaturas.length) {
    return (
      <p className="field__hint">
        Aún no tienes asignaturas. <Link href="/asignaturas">Crea una primero</Link>.
      </p>
    )
  }

  const porCurso = asignaturas.reduce((acc, asignatura) => {
    const key = asignatura.curso ? `${asignatura.curso}º curso` : 'Sin curso'
    ;(acc[key] ||= []).push(asignatura)
    return acc
  }, {} as Record<string, Asignatura[]>)

  return (
    <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Selecciona una asignatura</option>
      {Object.entries(porCurso).map(([curso, lista]) => (
        <optgroup key={curso} label={curso}>
          {lista.map((asignatura) => (
            <option key={asignatura.id} value={asignatura.id}>{asignatura.nombre}</option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}
