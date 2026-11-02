import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faListCheck, faTrophy } from '@fortawesome/free-solid-svg-icons'
import { doc, updateDoc } from 'firebase/firestore'
import AppShell, { EmptyState, Skeleton } from '@/components/AppShell'
import ModalTarea from '@/components/ModalTarea'
import { useAuth } from '@/lib/auth'
import { useData } from '@/lib/data'
import { db } from '@/lib/firebaseClient'
import { daysUntil, describeDue } from '@/lib/dates'
import { COLOR_POR_DEFECTO, type Tarea } from '@/lib/types'
import { notifyError } from '@/lib/ui'

type Filtro = 'pendientes' | 'hechas' | 'todas'

const grupoDe = (tarea: Tarea) => {
  if (tarea.completada) return 'Completadas'
  if (!tarea.fecha_entrega) return 'Sin fecha'
  const diff = daysUntil(tarea.fecha_entrega)
  if (diff < 0) return 'Atrasadas'
  if (diff === 0) return 'Hoy'
  if (diff < 7) return 'Próximos 7 días'
  return 'Más adelante'
}

const ORDEN_GRUPOS = ['Atrasadas', 'Hoy', 'Próximos 7 días', 'Más adelante', 'Sin fecha', 'Completadas']

export default function TareasPage() {
  const { user } = useAuth()
  const { tareas, asignaturas, asignaturasMap, cargando } = useData()
  const [filtro, setFiltro] = useState<Filtro>('pendientes')
  const [asignaturaFiltro, setAsignaturaFiltro] = useState<string | null>(null)
  const [modal, setModal] = useState<{ open: boolean; tarea: Tarea | null }>({ open: false, tarea: null })

  const pendientes = tareas.filter((t) => !t.completada).length
  const hechas = tareas.length - pendientes

  const grupos = useMemo(() => {
    const visibles = tareas
      .filter((t) => (filtro === 'pendientes' ? !t.completada : filtro === 'hechas' ? t.completada : true))
      .filter((t) => !asignaturaFiltro || t.asignatura_id === asignaturaFiltro)
      .sort((a, b) => (a.fecha_entrega || '9999').localeCompare(b.fecha_entrega || '9999'))
    const map = new Map<string, Tarea[]>()
    visibles.forEach((tarea) => {
      const grupo = grupoDe(tarea)
      map.set(grupo, [...(map.get(grupo) ?? []), tarea])
    })
    return ORDEN_GRUPOS.filter((g) => map.has(g)).map((g) => [g, map.get(g)!] as const)
  }, [tareas, filtro, asignaturaFiltro])

  const asignaturasConTareas = asignaturas.filter((a) => tareas.some((t) => t.asignatura_id === a.id))

  const toggle = async (tarea: Tarea) => {
    try {
      await updateDoc(doc(db, 'tareas', tarea.id), { completada: !tarea.completada })
      if (!tarea.completada) toast.success('¡Tarea completada!')
    } catch (err) {
      notifyError(err, 'No se pudo actualizar la tarea')
    }
  }

  return (
    <AppShell
      title="Tareas"
      subtitle={`${pendientes} pendiente${pendientes === 1 ? '' : 's'} · ${hechas} hecha${hechas === 1 ? '' : 's'}`}
      onAdd={() => setModal({ open: true, tarea: null })}
      addLabel="Nueva tarea"
    >
      <div className="toolbar">
        <div className="segmented" role="tablist" aria-label="Estado">
          {([
            ['pendientes', `Pendientes (${pendientes})`],
            ['hechas', `Hechas (${hechas})`],
            ['todas', 'Todas'],
          ] as const).map(([value, label]) => (
            <button key={value} type="button" role="tab" aria-selected={filtro === value} className={filtro === value ? 'is-active' : ''} onClick={() => setFiltro(value)}>
              {label}
            </button>
          ))}
        </div>
        {asignaturasConTareas.length > 1 && (
          <div className="chips chips--scroll" aria-label="Filtrar por asignatura">
            <button type="button" className={`chip ${!asignaturaFiltro ? 'is-active' : ''}`} onClick={() => setAsignaturaFiltro(null)}>Todas</button>
            {asignaturasConTareas.map((a) => (
              <button
                key={a.id}
                type="button"
                className={`chip ${asignaturaFiltro === a.id ? 'is-active' : ''}`}
                style={{ '--item': asignaturasMap.get(a.id)?.color } as React.CSSProperties}
                onClick={() => setAsignaturaFiltro(asignaturaFiltro === a.id ? null : a.id)}
              >
                <i className="dot" /> {a.nombre}
              </button>
            ))}
          </div>
        )}
      </div>

      {cargando ? (
        <Skeleton rows={5} />
      ) : !grupos.length ? (
        filtro === 'pendientes' && tareas.length ? (
          <EmptyState icon={faTrophy} title="¡Todo hecho!" text="No te queda ninguna tarea pendiente." />
        ) : (
          <EmptyState
            icon={faListCheck}
            title="No hay tareas"
            text="Apunta prácticas, trabajos y entregas para no olvidarte de nada."
            action={<button type="button" className="btn btn--primary" onClick={() => setModal({ open: true, tarea: null })}>Nueva tarea</button>}
          />
        )
      ) : (
        <div className="stack">
          {grupos.map(([grupo, lista]) => (
            <section key={grupo} className="card">
              <div className="card__head">
                <h2 className={grupo === 'Atrasadas' ? 'text-danger' : undefined}>{grupo}</h2>
                <span className="muted">{lista.length}</span>
              </div>
              <ul className="task-list">
                {lista.map((tarea) => {
                  const asignatura = asignaturasMap.get(tarea.asignatura_id)
                  const diff = tarea.fecha_entrega ? daysUntil(tarea.fecha_entrega) : null
                  return (
                    <li key={tarea.id} className={`task ${tarea.completada ? 'is-done' : ''}`} style={{ '--item': asignatura?.color || COLOR_POR_DEFECTO } as React.CSSProperties}>
                      <button type="button" className="check" onClick={() => toggle(tarea)} aria-pressed={tarea.completada} aria-label={tarea.completada ? `Marcar ${tarea.titulo} como pendiente` : `Completar ${tarea.titulo}`}>
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                      <button type="button" className="task__body" onClick={() => setModal({ open: true, tarea })}>
                        <strong>{tarea.titulo}</strong>
                        <small><i className="dot" /> {asignatura?.nombre || 'Sin asignatura'}</small>
                      </button>
                      {tarea.fecha_entrega && (
                        <span className={`due ${!tarea.completada && diff! < 0 ? 'due--late' : !tarea.completada && diff! <= 2 ? 'due--soon' : ''}`}>
                          {describeDue(tarea.fecha_entrega)}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      {user && (
        <ModalTarea
          open={modal.open}
          tarea={modal.tarea}
          asignaturaPorDefecto={asignaturaFiltro ?? undefined}
          userId={user.uid}
          onClose={() => setModal((s) => ({ ...s, open: false }))}
        />
      )}
    </AppShell>
  )
}
