import { useMemo, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faAngleLeft,
  faAngleRight,
  faCalendarDay,
  faCalendarPlus,
  faChalkboardUser,
  faCheck,
  faClock,
  faListCheck,
  faMugHot,
} from '@fortawesome/free-solid-svg-icons'
import { doc, updateDoc } from 'firebase/firestore'
import AppShell, { EmptyState, Skeleton } from './AppShell'
import Modal from './Modal'
import ModalEvento from './ModalEvento'
import ModalHorario from './ModalHorario'
import ModalTarea from './ModalTarea'
import { useAuth } from '@/lib/auth'
import { useData } from '@/lib/data'
import { db } from '@/lib/firebaseClient'
import {
  addDays,
  capitalize,
  describeDue,
  daysUntil,
  formatDate,
  fromDateKey,
  monthGrid,
  nombreDia,
  parseHour,
  startOfWeek,
  toDateKey,
  todayKey,
} from '@/lib/dates'
import { COLOR_POR_DEFECTO, type Evento, type Horario, type Tarea } from '@/lib/types'
import { MOBILE_QUERY, notifyError, useMediaQuery } from '@/lib/ui'

type CalendarItem = {
  id: string
  title: string
  subtitle: string
  date: string
  color: string
  /** Solo las clases tienen hora; eventos y entregas son de día completo. */
  startHour?: number
  hora?: string
  kind: 'clase' | 'tarea' | 'evento'
  horario?: Horario
  tarea?: Tarea
  evento?: Evento
}

type Positioned = CalendarItem & { startHour: number; lane: number; lanes: number }
type View = 'day' | 'week' | 'month'

const CLASS_DURATION = 1.5
const HOUR_PX = 56

/** Reparte en carriles las clases que se solapan dentro del mismo día. */
const layoutDayItems = (items: CalendarItem[]): Positioned[] => {
  const sorted = items
    .filter((item): item is CalendarItem & { startHour: number } => item.startHour !== undefined)
    .sort((a, b) => a.startHour - b.startHour)
  const result: Positioned[] = []
  let cluster: Positioned[] = []
  let laneEnds: number[] = []
  let clusterEnd = -1

  const flush = () => {
    cluster.forEach((item) => (item.lanes = Math.max(1, laneEnds.length)))
    result.push(...cluster)
    cluster = []
    laneEnds = []
  }

  sorted.forEach((item) => {
    if (cluster.length && item.startHour >= clusterEnd) flush()
    const free = laneEnds.findIndex((end) => end <= item.startHour)
    const lane = free === -1 ? laneEnds.length : free
    laneEnds[lane] = item.startHour + CLASS_DURATION
    clusterEnd = Math.max(cluster.length ? clusterEnd : 0, item.startHour + CLASS_DURATION)
    cluster.push({ ...item, lane, lanes: 1 })
  })
  flush()
  return result
}

const saludo = () => {
  const hour = new Date().getHours()
  if (hour < 13) return 'Buenos días'
  if (hour < 21) return 'Buenas tardes'
  return 'Buenas noches'
}

export default function Dashboard() {
  const { user } = useAuth()
  const { horarios, tareas, eventos, asignaturasMap, cargando } = useData()
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const userId = user!.uid

  const [selected, setSelected] = useState(todayKey())
  const [view, setView] = useState<View>('week')
  const [quickAdd, setQuickAdd] = useState(false)
  const [eventoModal, setEventoModal] = useState<{ open: boolean; evento: Evento | null }>({ open: false, evento: null })
  const [tareaModal, setTareaModal] = useState<{ open: boolean; tarea: Tarea | null }>({ open: false, tarea: null })
  const [horarioModal, setHorarioModal] = useState<{ open: boolean; horario: Horario | null }>({ open: false, horario: null })

  // En móvil la vista "día" no aporta nada frente a la semana con agenda.
  const activeView: View = isMobile && view === 'day' ? 'week' : view
  const selectedDate = fromDateKey(selected)
  const today = todayKey()

  const semana = useMemo(() => {
    const start = startOfWeek(fromDateKey(selected))
    return Array.from({ length: 7 }, (_, index) => addDays(start, index))
  }, [selected])
  const mes = useMemo(() => monthGrid(fromDateKey(selected)), [selected])
  const visibleDays = activeView === 'month' ? mes : activeView === 'day' ? [selectedDate] : semana

  const itemsPorFecha = useMemo(() => {
    const map: Record<string, CalendarItem[]> = {}
    const push = (item: CalendarItem) => (map[item.date] ||= []).push(item)

    const days = [...mes, ...semana].filter((day, index, all) => all.findIndex((d) => toDateKey(d) === toDateKey(day)) === index)

    days.forEach((day) => {
      const key = toDateKey(day)
      const dayName = nombreDia(day)
      horarios.forEach((horario) => {
        if (!horario.dias?.includes(dayName)) return
        const asignatura = asignaturasMap.get(horario.asignatura_id)
        push({
          id: `clase-${horario.id}-${key}`,
          title: asignatura?.nombre || 'Asignatura eliminada',
          subtitle: capitalize(horario.tipo || 'clase'),
          date: key,
          color: asignatura?.color || COLOR_POR_DEFECTO,
          startHour: parseHour(horario.hora),
          hora: horario.hora,
          kind: 'clase',
          horario,
        })
      })
    })

    tareas.forEach((tarea) => {
      if (!tarea.fecha_entrega || tarea.completada) return
      const asignatura = asignaturasMap.get(tarea.asignatura_id)
      push({
        id: `tarea-${tarea.id}`,
        title: tarea.titulo,
        subtitle: asignatura ? `Entrega · ${asignatura.nombre}` : 'Entrega',
        date: tarea.fecha_entrega,
        color: asignatura?.color || '#f43f5e',
        kind: 'tarea',
        tarea,
      })
    })

    eventos.forEach((evento) => {
      push({
        id: `evento-${evento.id}`,
        title: evento.title,
        subtitle: 'Evento',
        date: evento.start,
        color: evento.color || COLOR_POR_DEFECTO,
        kind: 'evento',
        evento,
      })
    })

    Object.values(map).forEach((items) =>
      items.sort((a, b) => (a.startHour ?? -1) - (b.startHour ?? -1) || a.title.localeCompare(b.title))
    )
    return map
  }, [asignaturasMap, eventos, horarios, mes, semana, tareas])

  const pendientes = useMemo(
    () =>
      tareas
        .filter((tarea) => !tarea.completada)
        .sort((a, b) => (a.fecha_entrega || '9999').localeCompare(b.fecha_entrega || '9999')),
    [tareas]
  )

  const proximos = useMemo(() => {
    const limit = toDateKey(addDays(new Date(), 14))
    return eventos.filter((evento) => evento.start >= today && evento.start <= limit).slice(0, 5)
  }, [eventos, today])

  const hoyItems = itemsPorFecha[today] || []
  const clasesHoy = hoyItems.filter((item) => item.kind === 'clase').length
  const entregasSemana = pendientes.filter((tarea) => tarea.fecha_entrega && daysUntil(tarea.fecha_entrega) >= 0 && daysUntil(tarea.fecha_entrega) < 7).length
  const atrasadas = pendientes.filter((tarea) => tarea.fecha_entrega && daysUntil(tarea.fecha_entrega) < 0).length

  const horas = useMemo(() => {
    const starts = horarios.map((h) => parseHour(h.hora))
    const first = Math.floor(Math.min(8, ...starts))
    const last = Math.ceil(Math.max(20, ...starts.map((s) => s + CLASS_DURATION)))
    return Array.from({ length: last - first }, (_, index) => first + index)
  }, [horarios])

  const mover = (direction: -1 | 1) => {
    if (activeView === 'day') return setSelected(toDateKey(addDays(selectedDate, direction)))
    if (activeView === 'month') {
      return setSelected(toDateKey(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + direction, 1)))
    }
    setSelected(toDateKey(addDays(selectedDate, direction * 7)))
  }

  const titulo =
    activeView === 'day'
      ? capitalize(formatDate(selectedDate, { weekday: 'long', day: 'numeric', month: 'long' }))
      : activeView === 'month' || isMobile
        ? capitalize(formatDate(selectedDate, { month: 'long', year: 'numeric' }))
        : `${formatDate(semana[0], { day: 'numeric', month: 'short' })} – ${formatDate(semana[6], { day: 'numeric', month: 'short', year: 'numeric' })}`

  const toggleTarea = async (tarea: Tarea) => {
    try {
      await updateDoc(doc(db, 'tareas', tarea.id), { completada: !tarea.completada })
      if (!tarea.completada) toast.success('¡Tarea completada!')
    } catch (err) {
      notifyError(err, 'No se pudo actualizar la tarea')
    }
  }

  const abrirItem = (item: CalendarItem) => {
    if (item.evento) setEventoModal({ open: true, evento: item.evento })
    else if (item.tarea) setTareaModal({ open: true, tarea: item.tarea })
    else if (item.horario) setHorarioModal({ open: true, horario: item.horario })
  }

  const nombre = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || ''
  const selectedItems = itemsPorFecha[selected] || []

  const agenda = (
    <section className="card">
      <div className="card__head">
        <h2>
          {selected === today ? 'Hoy' : capitalize(formatDate(selectedDate, { weekday: 'long', day: 'numeric', month: 'long' }))}
        </h2>
        <span className="muted">{selectedItems.length || 'Sin'} elemento{selectedItems.length === 1 ? '' : 's'}</span>
      </div>
      {selectedItems.length ? (
        <ul className="agenda">
          {selectedItems.map((item) => (
            <li key={item.id} style={{ '--item': item.color } as React.CSSProperties}>
              <button type="button" className={`agenda-item agenda-item--${item.kind}`} onClick={() => abrirItem(item)}>
                <span className="agenda-item__time">{item.hora || (item.kind === 'tarea' ? 'Entrega' : 'Todo el día')}</span>
                <span className="agenda-item__body">
                  <strong>{item.title}</strong>
                  <small>{item.subtitle}</small>
                </span>
              </button>
              {item.tarea && (
                <button type="button" className="check" onClick={() => toggleTarea(item.tarea!)} aria-label={`Completar ${item.title}`}>
                  <FontAwesomeIcon icon={faCheck} />
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={faMugHot} title="Día libre" text="No hay clases, entregas ni eventos." />
      )}
    </section>
  )

  return (
    <AppShell title={nombre ? `${saludo()}, ${nombre}` : saludo()} subtitle={capitalize(formatDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long' }))} onAdd={() => setQuickAdd(true)} addLabel="Nuevo">
      {cargando ? (
        <Skeleton rows={4} />
      ) : (
        <div className="dashboard">
          <div className="stats">
            <button type="button" className="stat" onClick={() => { setSelected(today); setView('day') }}>
              <span className="stat__icon"><FontAwesomeIcon icon={faChalkboardUser} /></span>
              <strong>{clasesHoy}</strong>
              <span>clases hoy</span>
            </button>
            <Link href="/tareas" className="stat">
              <span className="stat__icon"><FontAwesomeIcon icon={faClock} /></span>
              <strong>{entregasSemana}</strong>
              <span>entregas en 7 días</span>
            </Link>
            <Link href="/tareas" className={`stat ${atrasadas ? 'stat--alert' : ''}`}>
              <span className="stat__icon"><FontAwesomeIcon icon={faListCheck} /></span>
              <strong>{pendientes.length}</strong>
              <span>{atrasadas ? `pendientes · ${atrasadas} atrasada${atrasadas === 1 ? '' : 's'}` : 'tareas pendientes'}</span>
            </Link>
          </div>

          <div className="dashboard__main">
            <section className="card calendar">
              <div className="calendar__toolbar">
                <div className="calendar__nav">
                  <button type="button" className="icon-btn" onClick={() => mover(-1)} aria-label="Anterior"><FontAwesomeIcon icon={faAngleLeft} /></button>
                  <h2>{titulo}</h2>
                  <button type="button" className="icon-btn" onClick={() => mover(1)} aria-label="Siguiente"><FontAwesomeIcon icon={faAngleRight} /></button>
                </div>
                <div className="calendar__controls">
                  {selected !== today && <button type="button" className="btn btn--ghost btn--sm" onClick={() => setSelected(today)}>Hoy</button>}
                  <div className="segmented" role="tablist" aria-label="Vista">
                    {(isMobile ? (['week', 'month'] as const) : (['day', 'week', 'month'] as const)).map((v) => (
                      <button key={v} type="button" role="tab" aria-selected={activeView === v} className={activeView === v ? 'is-active' : ''} onClick={() => setView(v)}>
                        {v === 'day' ? 'Día' : v === 'week' ? 'Semana' : 'Mes'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {activeView === 'month' ? (
                <div className="month">
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => <span key={d} className="month__weekday">{d}</span>)}
                  {mes.map((day) => {
                    const key = toDateKey(day)
                    const items = itemsPorFecha[key] || []
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`month__day ${day.getMonth() !== selectedDate.getMonth() ? 'is-muted' : ''} ${key === selected ? 'is-selected' : ''} ${key === today ? 'is-today' : ''}`}
                        onClick={() => setSelected(key)}
                        aria-label={`${formatDate(day, { day: 'numeric', month: 'long' })}: ${items.length} elementos`}
                      >
                        <strong>{day.getDate()}</strong>
                        <span className="dots">
                          {items.slice(0, 4).map((item) => <i key={item.id} style={{ background: item.color }} />)}
                        </span>
                        {!isMobile && items.filter((i) => i.kind !== 'clase').slice(0, 2).map((item) => (
                          <small key={item.id} style={{ '--item': item.color } as React.CSSProperties}>{item.title}</small>
                        ))}
                      </button>
                    )
                  })}
                </div>
              ) : isMobile ? (
                <div className="week-strip">
                  {semana.map((day) => {
                    const key = toDateKey(day)
                    const items = itemsPorFecha[key] || []
                    return (
                      <button key={key} type="button" className={`week-strip__day ${key === selected ? 'is-selected' : ''} ${key === today ? 'is-today' : ''}`} onClick={() => setSelected(key)}>
                        <span>{capitalize(formatDate(day, { weekday: 'short' })).replace('.', '')}</span>
                        <strong>{day.getDate()}</strong>
                        <span className="dots">{items.slice(0, 3).map((item) => <i key={item.id} style={{ background: item.color }} />)}</span>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="timegrid" style={{ '--days': visibleDays.length, '--hour': `${HOUR_PX}px` } as React.CSSProperties}>
                  <div className="timegrid__head">
                    <span />
                    {visibleDays.map((day) => {
                      const key = toDateKey(day)
                      return (
                        <button key={key} type="button" className={`timegrid__day ${key === selected ? 'is-selected' : ''} ${key === today ? 'is-today' : ''}`} onClick={() => setSelected(key)}>
                          <span>{capitalize(formatDate(day, { weekday: 'short' })).replace('.', '')}</span>
                          <strong>{day.getDate()}</strong>
                        </button>
                      )
                    })}
                  </div>
                  <div className="timegrid__allday">
                    <span>Día</span>
                    {visibleDays.map((day) => {
                      const key = toDateKey(day)
                      return (
                        <div key={key}>
                          {(itemsPorFecha[key] || []).filter((item) => item.kind !== 'clase').map((item) => (
                            <button key={item.id} type="button" className={`pill pill--${item.kind}`} style={{ '--item': item.color } as React.CSSProperties} onClick={() => abrirItem(item)} title={item.subtitle}>
                              {item.title}
                            </button>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                  <div className="timegrid__body" style={{ height: horas.length * HOUR_PX }}>
                    <div className="timegrid__hours">
                      {horas.map((hora) => <span key={hora}>{String(hora).padStart(2, '0')}:00</span>)}
                    </div>
                    {visibleDays.map((day) => {
                      const key = toDateKey(day)
                      const nowOffset = key === today ? (new Date().getHours() + new Date().getMinutes() / 60 - horas[0]) * HOUR_PX : null
                      return (
                        <div key={key} className={`timegrid__col ${key === today ? 'is-today' : ''}`} onClick={() => setSelected(key)}>
                          {nowOffset !== null && nowOffset >= 0 && nowOffset <= horas.length * HOUR_PX && <span className="now-line" style={{ top: nowOffset }} />}
                          {layoutDayItems(itemsPorFecha[key] || []).map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              className="block"
                              style={{
                                '--item': item.color,
                                top: (item.startHour - horas[0]) * HOUR_PX + 2,
                                height: CLASS_DURATION * HOUR_PX - 4,
                                left: `calc(${(item.lane / item.lanes) * 100}% + 2px)`,
                                width: `calc(${100 / item.lanes}% - 4px)`,
                              } as React.CSSProperties}
                              onClick={(event) => { event.stopPropagation(); abrirItem(item) }}
                            >
                              <strong>{item.title}</strong>
                              <span>{item.hora} · {item.subtitle}</span>
                            </button>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </section>

            {(isMobile || activeView === 'month') && agenda}
          </div>

          <aside className="dashboard__side">
            {!isMobile && activeView !== 'month' && agenda}

            <section className="card">
              <div className="card__head">
                <h2>Pendientes</h2>
                <Link href="/tareas" className="link">Ver todas</Link>
              </div>
              {pendientes.length ? (
                <ul className="task-list">
                  {pendientes.slice(0, 5).map((tarea) => {
                    const asignatura = asignaturasMap.get(tarea.asignatura_id)
                    const diff = tarea.fecha_entrega ? daysUntil(tarea.fecha_entrega) : null
                    return (
                      <li key={tarea.id} className="task" style={{ '--item': asignatura?.color || COLOR_POR_DEFECTO } as React.CSSProperties}>
                        <button type="button" className="check" onClick={() => toggleTarea(tarea)} aria-label={`Completar ${tarea.titulo}`}>
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
                        <button type="button" className="task__body" onClick={() => setTareaModal({ open: true, tarea })}>
                          <strong>{tarea.titulo}</strong>
                          <small>{asignatura?.nombre || 'Sin asignatura'}</small>
                        </button>
                        {tarea.fecha_entrega && (
                          <span className={`due ${diff! < 0 ? 'due--late' : diff! <= 2 ? 'due--soon' : ''}`}>{describeDue(tarea.fecha_entrega)}</span>
                        )}
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <EmptyState icon={faCheck} title="Todo al día" text="No tienes tareas pendientes." />
              )}
            </section>

            {proximos.length > 0 && (
              <section className="card">
                <div className="card__head"><h2>Próximos eventos</h2></div>
                <ul className="upcoming">
                  {proximos.map((evento) => {
                    const date = fromDateKey(evento.start)
                    return (
                      <li key={evento.id}>
                        <button type="button" onClick={() => setEventoModal({ open: true, evento })} style={{ '--item': evento.color || COLOR_POR_DEFECTO } as React.CSSProperties}>
                          <span className="date-badge">
                            <small>{formatDate(date, { month: 'short' }).replace('.', '')}</small>
                            <strong>{date.getDate()}</strong>
                          </span>
                          <span>
                            <strong>{evento.title}</strong>
                            <small>{describeDue(evento.start)}</small>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )}
          </aside>
        </div>
      )}

      <Modal open={quickAdd} onClose={() => setQuickAdd(false)} title="Añadir" subtitle={capitalize(formatDate(selectedDate, { weekday: 'long', day: 'numeric', month: 'long' }))}>
        <div className="action-list">
          <button type="button" onClick={() => { setQuickAdd(false); setEventoModal({ open: true, evento: null }) }}>
            <span className="action-list__icon"><FontAwesomeIcon icon={faCalendarPlus} /></span>
            <span><strong>Evento</strong><small>Examen, tutoría, fecha importante…</small></span>
          </button>
          <button type="button" onClick={() => { setQuickAdd(false); setTareaModal({ open: true, tarea: null }) }}>
            <span className="action-list__icon"><FontAwesomeIcon icon={faListCheck} /></span>
            <span><strong>Tarea</strong><small>Práctica, trabajo o entrega</small></span>
          </button>
          <button type="button" onClick={() => { setQuickAdd(false); setHorarioModal({ open: true, horario: null }) }}>
            <span className="action-list__icon"><FontAwesomeIcon icon={faCalendarDay} /></span>
            <span><strong>Clase</strong><small>Bloque semanal del horario</small></span>
          </button>
        </div>
      </Modal>

      <ModalEvento open={eventoModal.open} evento={eventoModal.evento} fechaPorDefecto={selected} userId={userId} onClose={() => setEventoModal((s) => ({ ...s, open: false }))} />
      <ModalTarea open={tareaModal.open} tarea={tareaModal.tarea} userId={userId} onClose={() => setTareaModal((s) => ({ ...s, open: false }))} />
      <ModalHorario open={horarioModal.open} horario={horarioModal.horario} diaPorDefecto={nombreDia(selectedDate)} userId={userId} onClose={() => setHorarioModal((s) => ({ ...s, open: false }))} />
    </AppShell>
  )
}
