import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBook, faCalendarDays, faChartColumn, faListCheck } from '@fortawesome/free-solid-svg-icons'
import AppShell, { EmptyState, Skeleton } from '@/components/AppShell'
import ModalAsignatura from '@/components/ModalAsignatura'
import { useAuth } from '@/lib/auth'
import { useData } from '@/lib/data'
import { calcularNotaFinal, formatNota, gradeTone, mediaEvaluada } from '@/lib/grades'
import type { Asignatura } from '@/lib/types'

export default function AsignaturasPage() {
  const { user } = useAuth()
  const { asignaturas, asignaturasMap, tareas, horarios, notas, cargando } = useData()
  const [modal, setModal] = useState<{ open: boolean; asignatura: Asignatura | null; curso?: number }>({ open: false, asignatura: null })

  const porCurso = asignaturas.reduce((acc, asignatura) => {
    const key = asignatura.curso ?? 0
    ;(acc[key] ||= []).push(asignatura)
    return acc
  }, {} as Record<number, Asignatura[]>)
  const cursos = Object.keys(porCurso).map(Number).sort((a, b) => (a || 99) - (b || 99))

  return (
    <AppShell
      title="Asignaturas"
      subtitle={`${asignaturas.length} asignatura${asignaturas.length === 1 ? '' : 's'} · ${cursos.length} curso${cursos.length === 1 ? '' : 's'}`}
      onAdd={() => setModal({ open: true, asignatura: null })}
      addLabel="Nueva asignatura"
    >
      {cargando ? (
        <Skeleton />
      ) : !asignaturas.length ? (
        <EmptyState
          icon={faBook}
          title="Empieza por tus asignaturas"
          text="Son la base de todo: horario, tareas y notas se organizan por asignatura."
          action={<button type="button" className="btn btn--primary" onClick={() => setModal({ open: true, asignatura: null })}>Añadir asignatura</button>}
        />
      ) : (
        <div className="stack">
          {cursos.map((curso) => (
            <section key={curso}>
              <div className="section-title">
                <h2>{curso ? `${curso}º curso` : 'Sin curso'}</h2>
                <span className="muted">{porCurso[curso].length}</span>
              </div>
              <div className="subject-grid">
                {porCurso[curso].map((asignatura) => {
                  const color = asignaturasMap.get(asignatura.id)?.color
                  const pendientes = tareas.filter((t) => t.asignatura_id === asignatura.id && !t.completada).length
                  const clases = horarios.filter((h) => h.asignatura_id === asignatura.id).reduce((acc, h) => acc + (h.dias?.length || 0), 0)
                  const notasAsignatura = notas.filter((n) => n.asignatura_id === asignatura.id)
                  const final = notasAsignatura.length ? calcularNotaFinal(notasAsignatura) : null
                  return (
                    <button
                      key={asignatura.id}
                      type="button"
                      className="subject"
                      style={{ '--item': color } as React.CSSProperties}
                      onClick={() => setModal({ open: true, asignatura })}
                    >
                      <span className="subject__head">
                        <span className="subject__badge">{asignatura.nombre.slice(0, 2).toUpperCase()}</span>
                        {final !== null && <span className={`grade ${gradeTone(mediaEvaluada(notasAsignatura))}`}>{formatNota(final)}</span>}
                      </span>
                      <strong>{asignatura.nombre}</strong>
                      <span className="subject__meta">
                        <span><FontAwesomeIcon icon={faCalendarDays} /> {clases} clase{clases === 1 ? '' : 's'}/sem</span>
                        <span><FontAwesomeIcon icon={faListCheck} /> {pendientes} pendiente{pendientes === 1 ? '' : 's'}</span>
                        {final === null && <span><FontAwesomeIcon icon={faChartColumn} /> Sin notas</span>}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {user && (
        <ModalAsignatura
          open={modal.open}
          asignatura={modal.asignatura}
          cursoPorDefecto={cursos.filter(Boolean).at(-1) ?? 1}
          userId={user.uid}
          onClose={() => setModal((s) => ({ ...s, open: false }))}
        />
      )}
    </AppShell>
  )
}
