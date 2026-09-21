import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { db } from '@/lib/firebaseClient'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faAngleLeft,
  faAngleRight,
  faBook,
  faCalendarDays,
  faChartColumn,
  faCheck,
  faClock,
  faGraduationCap,
  faHome,
  faMagnifyingGlass,
  faMoon,
  faPlus,
  faRightFromBracket,
  faSun,
  faTasks,
} from '@fortawesome/free-solid-svg-icons'
import ModalEvento from './ModalEvento'
import ModalUsuario from './ModalUsuario'
import Swal from 'sweetalert2'
import { getStoredTheme, setStoredTheme, type Theme } from '@/lib/theme'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'

type Evento = { id: string; title: string; start: string; color?: string }
type Horario = { id: string; asignatura_id: string; tipo: string; hora: string; dias: string[] }
type Tarea = { id: string; titulo: string; completada: boolean; created_at?: string; fecha_entrega?: string; asignatura_id: string }
type Asignatura = { id: string; nombre: string; color?: string; curso?: number }

type CalendarItem = {
  id: string
  title: string
  subtitle: string
  date: string
  startHour: number
  duration: number
  color: string
  kind: 'clase' | 'tarea' | 'evento'
  evento?: Evento
}

type CalendarView = 'day' | 'week' | 'month'
type PositionedCalendarItem = CalendarItem & {
  lane: number
  lanes: number
}

const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
const horas = Array.from({ length: 14 }, (_, index) => index + 8)
const palette = ['#6c8cff', '#8b6df6', '#4fc58b', '#f06aa3', '#f5b84b', '#49b6e8']

const toDateKey = (date: Date) => date.toLocaleDateString('en-CA')
const addDays = (date: Date, days: number) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}
const startOfWeek = (date: Date) => addDays(date, 1 - (date.getDay() || 7))
const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)
const formatDate = (date: Date, options: Intl.DateTimeFormatOptions) => date.toLocaleDateString('es-ES', options)
const parseHour = (value?: string) => {
  const match = value?.match(/(\d{1,2})(?::(\d{2}))?/)
  if (!match) return 9
  return Math.min(20, Math.max(8, Number(match[1]) + Number(match[2] || 0) / 60))
}
const getReadableName = (userName?: string | null, email?: string | null) =>
  userName?.split(' ')[0] || email?.split('@')[0] || 'estudiante'

const layoutDayItems = (items: CalendarItem[]): PositionedCalendarItem[] => {
  const sorted = [...items].sort((a, b) => a.startHour - b.startHour || b.duration - a.duration)
  const clusters: CalendarItem[][] = []
  let currentCluster: CalendarItem[] = []
  let clusterEnd = 0

  sorted.forEach((item) => {
    if (!currentCluster.length || item.startHour < clusterEnd) {
      currentCluster.push(item)
      clusterEnd = Math.max(clusterEnd, item.startHour + item.duration)
      return
    }

    clusters.push(currentCluster)
    currentCluster = [item]
    clusterEnd = item.startHour + item.duration
  })

  if (currentCluster.length) clusters.push(currentCluster)

  return clusters.flatMap((cluster) => {
    const laneEnds: number[] = []
    const positioned = cluster.map((item) => {
      const lane = laneEnds.findIndex((end) => end <= item.startHour)
      const nextLane = lane === -1 ? laneEnds.length : lane
      laneEnds[nextLane] = item.startHour + item.duration
      return { ...item, lane: nextLane, lanes: 1 }
    })
    const lanes = Math.max(1, laneEnds.length)
    return positioned.map((item) => ({ ...item, lanes }))
  })
}

export default function CalendarioUsuario({
  userId,
  userName,
  userEmail,
  onLogout,
}: {
  userId: string
  userName?: string | null
  userEmail?: string | null
  onLogout?: () => void
}) {
  const router = useRouter()
  const [eventos, setEventos] = useState<Evento[]>([])
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([])
  const [diaSeleccionado, setDiaSeleccionado] = useState<string>(toDateKey(new Date()))
  const [mesMini, setMesMini] = useState<Date>(new Date())
  const [cargando, setCargando] = useState(true)
  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [theme, setTheme] = useState<Theme>('light')
  const [vistaCalendario, setVistaCalendario] = useState<CalendarView>('week')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    cargarDashboard()
  }, [userId])

  useEffect(() => {
    setTheme(getStoredTheme())
  }, [])

  const cambiarTema = (nextTheme: Theme) => {
    setTheme(nextTheme)
    setStoredTheme(nextTheme)
  }

  const asignaturasMap = useMemo(
    () => new Map(asignaturas.map((asignatura, index) => [
      asignatura.id,
      { ...asignatura, color: asignatura.color || palette[index % palette.length] },
    ])),
    [asignaturas]
  )
  const selectedDate = new Date(`${diaSeleccionado}T12:00:00`)
  const semana = useMemo(() => {
    const inicio = startOfWeek(selectedDate)
    return Array.from({ length: 7 }, (_, index) => addDays(inicio, index))
  }, [diaSeleccionado])
  const diasVisibles = vistaCalendario === 'day' ? [selectedDate] : semana
  const diasMesPrincipal = useMemo(() => {
    const first = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    const start = addDays(first, -((first.getDay() + 6) % 7))
    return Array.from({ length: 42 }, (_, index) => addDays(start, index))
  }, [diaSeleccionado])
  const diasParaHorarios = vistaCalendario === 'month' ? diasMesPrincipal : diasVisibles

  const cargarDashboard = async () => {
    setCargando(true)
    setError(null)
    try {
      const [eventosSnapshot, asignaturasSnapshot, horariosSnapshot, tareasSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'eventos'), where('user_id', '==', userId))),
        getDocs(query(collection(db, 'asignaturas'), where('user_id', '==', userId), orderBy('nombre', 'asc'))),
        getDocs(query(collection(db, 'horario'), where('user_id', '==', userId), orderBy('hora', 'asc'))),
        getDocs(query(collection(db, 'tareas'), where('user_id', '==', userId), orderBy('created_at', 'desc'))),
      ])

      setEventos(eventosSnapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<Evento, 'id'>) })))
      setAsignaturas(asignaturasSnapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<Asignatura, 'id'>) })))
      setHorarios(horariosSnapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<Horario, 'id'>) })))
      setTareas(tareasSnapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<Tarea, 'id'>) })))
    } catch (err) {
      const firebaseError = err as { message?: string }
      setError(firebaseError.message || 'No se pudo cargar el dashboard.')
    } finally {
      setCargando(false)
    }
  }

  const cambiarEstadoTarea = async (id: string, completada: boolean) => {
    try {
      await updateDoc(doc(db, 'tareas', id), { completada })
      setTareas((current) => current.map((tarea) => tarea.id === id ? { ...tarea, completada } : tarea))
    } catch (err) {
      toast.error('No se pudo actualizar la tarea')
    }
  }

  const eliminarEvento = async (id: string) => {
    const confirmar = await Swal.fire({
      title: '¿Eliminar evento?',
      text: 'No podrás deshacer esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar',
    })
    if (confirmar.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'eventos', id))
        await cargarDashboard()
        toast.success('Evento eliminado')
      } catch (err) {
        toast.error('No se pudo eliminar el evento')
      }
    }
  }

  const itemsSemana = useMemo<CalendarItem[]>(() => {
    const items: CalendarItem[] = []
    horarios.forEach((horario) => {
      const asignatura = asignaturasMap.get(horario.asignatura_id)
      diasParaHorarios.forEach((dia) => {
        const nombreDia = diasSemana[dia.getDay() === 0 ? 6 : dia.getDay() - 1]
        if (!horario.dias?.includes(nombreDia)) return
        items.push({
          id: `horario-${horario.id}-${toDateKey(dia)}`,
          title: asignatura?.nombre || 'Asignatura',
          subtitle: `${capitalize(horario.tipo)} · ${horario.hora}`,
          date: toDateKey(dia),
          startHour: parseHour(horario.hora),
          duration: 1.4,
          color: asignatura?.color || '#6c8cff',
          kind: 'clase',
        })
      })
    })
    tareas.filter((tarea) => tarea.fecha_entrega && !tarea.completada).forEach((tarea) => {
      const asignatura = asignaturasMap.get(tarea.asignatura_id)
      items.push({
        id: `tarea-${tarea.id}`,
        title: tarea.titulo,
        subtitle: asignatura?.nombre ? `Entrega · ${asignatura.nombre}` : 'Entrega',
        date: tarea.fecha_entrega || '',
        startHour: 17,
        duration: 1,
        color: asignatura?.color || '#f06aa3',
        kind: 'tarea',
      })
    })
    eventos.forEach((evento) => {
      items.push({
        id: `evento-${evento.id}`,
        title: evento.title,
        subtitle: 'Evento',
        date: evento.start,
        startHour: 12,
        duration: 1,
        color: evento.color || '#8b6df6',
        kind: 'evento',
        evento,
      })
    })
    return items
  }, [asignaturasMap, diasParaHorarios, eventos, horarios, tareas])

  const tareasPendientes = tareas
    .filter((tarea) => !tarea.completada)
    .sort((a, b) => (a.fecha_entrega || '9999').localeCompare(b.fecha_entrega || '9999'))
    .slice(0, 5)
  const proximosEventos = itemsSemana
    .filter((item) => item.date >= toDateKey(new Date()))
    .sort((a, b) => `${a.date}-${a.startHour}`.localeCompare(`${b.date}-${b.startHour}`))
    .slice(0, 5)
  const diasMesMini = useMemo(() => {
    const first = new Date(mesMini.getFullYear(), mesMini.getMonth(), 1)
    const start = addDays(first, -((first.getDay() + 6) % 7))
    return Array.from({ length: 42 }, (_, index) => addDays(start, index))
  }, [mesMini])
  const itemsPorFecha = useMemo(() => {
    return itemsSemana.reduce((acc, item) => {
      acc[item.date] = [...(acc[item.date] || []), item]
      return acc
    }, {} as Record<string, CalendarItem[]>)
  }, [itemsSemana])
  const itemsPosicionadosPorFecha = useMemo(() => {
    return Object.entries(itemsPorFecha).reduce((acc, [date, items]) => {
      acc[date] = layoutDayItems(items)
      return acc
    }, {} as Record<string, PositionedCalendarItem[]>)
  }, [itemsPorFecha])

  const moverCalendario = (direction: -1 | 1) => {
    if (vistaCalendario === 'day') {
      setDiaSeleccionado(toDateKey(addDays(selectedDate, direction)))
      return
    }
    if (vistaCalendario === 'month') {
      setDiaSeleccionado(toDateKey(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + direction, 1)))
      return
    }
    setDiaSeleccionado(toDateKey(addDays(selectedDate, direction * 7)))
  }

  const tituloCalendario = (() => {
    if (vistaCalendario === 'day') {
      return capitalize(formatDate(selectedDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))
    }
    if (vistaCalendario === 'month') {
      return capitalize(formatDate(selectedDate, { month: 'long', year: 'numeric' }))
    }
    return `${formatDate(semana[0], { day: 'numeric', month: 'long' })} - ${formatDate(semana[6], { day: 'numeric', month: 'long', year: 'numeric' })}`
  })()

  const nombre = getReadableName(userName, userEmail)
  const totalPendientes = tareas.filter((tarea) => !tarea.completada).length

  return (
    <div className={`academic-shell ${theme === 'dark' ? 'academic-shell--dark' : ''}`}>
      <aside className="academic-sidebar">
        <Link href="/" className="academic-brand">
          <span><FontAwesomeIcon icon={faGraduationCap} /></span>
          <b>Agenda</b>
        </Link>
        <nav className="academic-nav">
          {[
            { href: '/', label: 'Inicio', icon: faHome },
            { href: '/horarios', label: 'Horario', icon: faCalendarDays },
            { href: '/asignaturas', label: 'Asignaturas', icon: faBook },
            { href: '/tareas', label: 'Tareas', icon: faTasks, badge: totalPendientes },
            { href: '/notas', label: 'Notas', icon: faChartColumn },
          ].map((item) => (
            <Link key={item.href} href={item.href} className={`academic-nav__item ${router.pathname === item.href ? 'is-active' : ''}`}>
              <FontAwesomeIcon icon={item.icon} />
              <span>{item.label}</span>
              {!!item.badge && <i>{item.badge}</i>}
            </Link>
          ))}
        </nav>
        <div className="academic-settings">
          <ModalUsuario />
          <span>Ajustes</span>
        </div>
      </aside>

      <main className="academic-main">
        <header className="academic-header">
          <label className="academic-search">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
            <input placeholder="Buscar asignaturas, tareas, eventos..." />
          </label>
          <div className="academic-actions">
            <div className="theme-toggle" aria-label="Selector de tema">
              <button className={theme === 'light' ? 'is-active' : ''} onClick={() => cambiarTema('light')} aria-label="Tema claro"><FontAwesomeIcon icon={faSun} /></button>
              <button className={theme === 'dark' ? 'is-active' : ''} onClick={() => cambiarTema('dark')} aria-label="Tema oscuro"><FontAwesomeIcon icon={faMoon} /></button>
            </div>
            <button className="academic-avatar" aria-label="Perfil">{nombre.slice(0, 2).toUpperCase()}</button>
            {onLogout && <button onClick={onLogout} aria-label="Cerrar sesión"><FontAwesomeIcon icon={faRightFromBracket} /></button>}
          </div>
        </header>

        {cargando ? (
          <div className="academic-loading">Preparando tu agenda...</div>
        ) : error ? (
          <div className="academic-dashboard">
            <section className="academic-content">
              <div className="error-panel"><strong>No se pudo cargar el dashboard</strong><p>{error}</p></div>
            </section>
          </div>
        ) : (
          <div className="academic-dashboard">
            <section className="academic-content">
              <div className="academic-hero">
                <div>
                  <h1>¡Hola, {nombre}!</h1>
                  <p>Organiza hoy, consigue mañana.</p>
                </div>
                <button onClick={() => { setEventoEditando(null); setModalVisible(true) }}>
                  <FontAwesomeIcon icon={faPlus} /> Nuevo evento
                </button>
              </div>

              <section className="week-card">
                <div className="week-card__toolbar">
                  <div className="week-card__nav">
                    <button onClick={() => moverCalendario(-1)} aria-label="Periodo anterior"><FontAwesomeIcon icon={faAngleLeft} /></button>
                    <button onClick={() => moverCalendario(1)} aria-label="Periodo siguiente"><FontAwesomeIcon icon={faAngleRight} /></button>
                    <h2>{tituloCalendario}</h2>
                  </div>
                  <div className="week-card__modes" aria-label="Vista del calendario">
                    {([
                      ['day', 'Día'],
                      ['week', 'Semana'],
                      ['month', 'Mes'],
                    ] as const).map(([view, label]) => (
                      <button
                        key={view}
                        className={vistaCalendario === view ? 'is-active' : ''}
                        onClick={() => setVistaCalendario(view)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <button className="week-card__today" onClick={() => setDiaSeleccionado(toDateKey(new Date()))}>Hoy</button>
                </div>

                {vistaCalendario === 'month' ? (
                  <div className="month-grid">
                    <div className="month-grid__weekdays">{['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day) => <span key={day}>{day}</span>)}</div>
                    <div className="month-grid__days">
                      {diasMesPrincipal.map((dia) => {
                        const dateKey = toDateKey(dia)
                        const dayItems = itemsPorFecha[dateKey] || []
                        return (
                          <button
                            key={dateKey}
                            className={`month-day ${dia.getMonth() !== selectedDate.getMonth() ? 'is-muted' : ''} ${dateKey === diaSeleccionado ? 'is-selected' : ''} ${dateKey === toDateKey(new Date()) ? 'is-today' : ''}`}
                            onClick={() => setDiaSeleccionado(dateKey)}
                          >
                            <strong>{dia.getDate()}</strong>
                            <span>{dayItems.slice(0, 3).map((item) => <i key={item.id} style={{ backgroundColor: item.color }} />)}</span>
                            {dayItems.length > 0 && <small>{dayItems.length} evento{dayItems.length === 1 ? '' : 's'}</small>}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`week-grid ${vistaCalendario === 'day' ? 'week-grid--day' : ''}`}
                    style={{ '--visible-days': diasVisibles.length } as React.CSSProperties}
                  >
                    <div className="week-grid__corner" />
                    {diasVisibles.map((dia, index) => (
                      <button
                        key={toDateKey(dia)}
                        className={`week-grid__day ${toDateKey(dia) === diaSeleccionado ? 'is-selected' : ''} ${toDateKey(dia) === toDateKey(new Date()) ? 'is-today' : ''}`}
                        style={{ gridColumn: index + 2, gridRow: 1 }}
                        onClick={() => setDiaSeleccionado(toDateKey(dia))}
                      >
                        <span>{capitalize(formatDate(dia, { weekday: 'short' }))}</span>
                        <strong>{dia.getDate()}</strong>
                      </button>
                    ))}
                    {horas.map((hora, index) => (
                      <div
                        key={`hour-${hora}`}
                        className="week-grid__hour"
                        style={{ gridColumn: 1, gridRow: index + 2 }}
                      >
                        {String(hora).padStart(2, '0')}:00
                      </div>
                    ))}
                    {diasVisibles.map((dia, index) => {
                      const dateKey = toDateKey(dia)
                      return (
                        <div
                          key={`col-${dateKey}`}
                          className="week-grid__column"
                          style={{ gridColumn: index + 2 }}
                        >
                          {(itemsPosicionadosPorFecha[dateKey] || []).map((item) => (
                            <button
                              key={item.id}
                              className={`week-event week-event--${item.kind}`}
                              style={{
                                '--event-color': item.color,
                                '--event-lane': item.lane,
                                '--event-lanes': item.lanes,
                                top: `${(item.startHour - 8) * 64 + 10}px`,
                                height: `${Math.max(48, item.duration * 56)}px`,
                              } as React.CSSProperties}
                              onClick={() => {
                                setDiaSeleccionado(item.date)
                                if (item.evento) { setEventoEditando(item.evento); setModalVisible(true) }
                              }}
                            >
                              <strong>{item.title}</strong>
                              <span>{item.subtitle}</span>
                            </button>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>

              <section className="subjects-strip">
                <div className="section-heading">
                  <h2>Mis asignaturas</h2>
                  <Link href="/asignaturas">Ver todas</Link>
                </div>
                <div className="subject-list">
                  {asignaturas.slice(0, 4).map((asignatura, index) => {
                    const color = asignatura.color || palette[index % palette.length]
                    const total = tareas.filter((tarea) => tarea.asignatura_id === asignatura.id).length
                    const done = tareas.filter((tarea) => tarea.asignatura_id === asignatura.id && tarea.completada).length
                    const progress = total ? Math.round((done / total) * 100) : null
                    return (
                      <article key={asignatura.id} className="subject-card" style={{ '--subject-color': color } as React.CSSProperties}>
                        <div><FontAwesomeIcon icon={faBook} /></div>
                        <h3>{asignatura.nombre}</h3>
                        {asignatura.curso && <p>{asignatura.curso}º curso</p>}
                        {progress !== null && <div className="subject-progress"><span><i style={{ width: `${progress}%` }} /></span><b>{progress}%</b></div>}
                      </article>
                    )
                  })}
                </div>
              </section>
            </section>

            <aside className="academic-right">
              <section className="side-card mini-calendar">
                <div className="side-card__header">
                  <h2>{capitalize(formatDate(mesMini, { month: 'long', year: 'numeric' }))}</h2>
                  <div>
                    <button onClick={() => setMesMini(new Date(mesMini.getFullYear(), mesMini.getMonth() - 1, 1))}><FontAwesomeIcon icon={faAngleLeft} /></button>
                    <button onClick={() => setMesMini(new Date(mesMini.getFullYear(), mesMini.getMonth() + 1, 1))}><FontAwesomeIcon icon={faAngleRight} /></button>
                  </div>
                </div>
                <div className="mini-calendar__weekdays">{['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => <span key={day}>{day}</span>)}</div>
                <div className="mini-calendar__days">
                  {diasMesMini.map((dia) => (
                    <button key={toDateKey(dia)} className={`${dia.getMonth() !== mesMini.getMonth() ? 'is-muted' : ''} ${toDateKey(dia) === diaSeleccionado ? 'is-selected' : ''} ${toDateKey(dia) === toDateKey(new Date()) ? 'is-today' : ''}`} onClick={() => setDiaSeleccionado(toDateKey(dia))}>{dia.getDate()}</button>
                  ))}
                </div>
              </section>

              <section className="side-card">
                <div className="side-card__header"><h2>Tareas pendientes</h2><Link href="/tareas">Ver todas</Link></div>
                <div className="task-list">
                  {tareasPendientes.length ? tareasPendientes.map((tarea) => {
                    const asignatura = asignaturasMap.get(tarea.asignatura_id)
                    return (
                      <label key={tarea.id} className="task-row">
                        <input type="checkbox" checked={tarea.completada} onChange={(event) => cambiarEstadoTarea(tarea.id, event.target.checked)} />
                        <span>{tarea.titulo}</span>
                        <i style={{ backgroundColor: asignatura?.color || '#6c8cff' }} />
                      </label>
                    )
                  }) : <p className="empty-state">No tienes tareas pendientes.</p>}
                </div>
              </section>

              <section className="side-card">
                <div className="side-card__header"><h2>Próximos eventos</h2><Link href="/horarios">Ver todos</Link></div>
                <div className="upcoming-list">
                  {proximosEventos.length ? proximosEventos.map((item) => (
                    <div key={item.id} className="upcoming-row">
                      <span style={{ '--event-color': item.color } as React.CSSProperties}><FontAwesomeIcon icon={item.kind === 'tarea' ? faCheck : item.kind === 'clase' ? faClock : faCalendarDays} /></span>
                      <div><strong>{item.title}</strong><p>{item.subtitle}</p></div>
                      <time>{formatDate(new Date(`${item.date}T12:00:00`), { weekday: 'short', day: 'numeric' })}</time>
                    </div>
                  )) : <p className="empty-state">No hay eventos próximos.</p>}
                </div>
              </section>
            </aside>
          </div>
        )}
      </main>

      <ModalEvento visible={modalVisible} onClose={() => setModalVisible(false)} evento={eventoEditando} fechaPorDefecto={diaSeleccionado} onSuccess={() => cargarDashboard()} userId={userId} />
    </div>
  )
}
