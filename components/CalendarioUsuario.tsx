import { useEffect, useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrash, faPen } from '@fortawesome/free-solid-svg-icons'
import ModalEvento from './ModalEvento'
import Swal from 'sweetalert2'

type Evento = {
  id: string
  title: string
  start: string
  color: string
}

type Horario = {
  id: string
  tipo: string
  hora: string
  dias: string[]
  asignaturas: { nombre: string }
}

type Tarea = {
  id: string
  titulo: string
  asignaturas: { nombre: string }
}

export default function CalendarioUsuario({ userId }: { userId: string }) {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [clases, setClases] = useState<Horario[]>([])
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [diaSeleccionado, setDiaSeleccionado] = useState<string>(new Date().toISOString().split('T')[0])
  const [cargando, setCargando] = useState(true)
  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  const calendarRef = useRef<FullCalendar | null>(null)

  useEffect(() => {
    cargarEventos()
  }, [])

  useEffect(() => {
    cargarClasesYTareas()
  }, [diaSeleccionado])

  const cargarEventos = async () => {
    setCargando(true)
    const { data } = await supabase.from('eventos').select('*').eq('user_id', userId)
    if (data) setEventos(data as Evento[])
    setCargando(false)
  }

  const cargarClasesYTareas = async () => {
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
    const diaNombre = diasSemana[new Date(diaSeleccionado).getDay()]

    const { data: horariosData } = await supabase
      .from('horario')
      .select('id, tipo, hora, dias, asignaturas(nombre)')
      .contains('dias', [diaNombre])


    const fecha = new Date(diaSeleccionado)
    const fechaInicio = new Date(fecha)
    fechaInicio.setHours(0, 0, 0, 0)

    const fechaFin = new Date(fecha)
    fechaFin.setHours(23, 59, 59, 999)

    const { data: tareasData } = await supabase
      .from('tareas')
      .select('id, titulo, asignaturas(nombre)')
      .gte('fecha_entrega', fechaInicio.toISOString())
      .lte('fecha_entrega', fechaFin.toISOString())
      .is('completada', false)

    if (horariosData) setClases(horariosData as unknown as Horario[])
    if (tareasData) setTareas(tareasData as unknown as Tarea[])
  }

  const eventosDelDia = eventos.filter(e => e.start === diaSeleccionado)

  const abrirModal = (evento: Evento | null = null) => {
    setEventoEditando(evento)
    setModalVisible(true)
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
      await supabase.from('eventos').delete().eq('id', id)
      await cargarEventos()
      toast.success('Evento eliminado', {
        style: { background: '#1a1a1a', color: '#fff' }
      })
    }
  }

  return (
    <div className="container mt-3 mb-5 pb-5">
      {cargando ? (
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : (
        <div className="row">
          <div className="col-md-7 mb-4">
            <div className="bg-dark rounded p-3 shadow text-white">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale={esLocale}
                events={eventos}
                selectable
                select={(arg) => setDiaSeleccionado(arg.startStr)}
                dateClick={(arg) => setDiaSeleccionado(arg.dateStr)}
                eventClick={(info) => setDiaSeleccionado(info.event.startStr)}
                height="auto"
                dayMaxEventRows={3}
                dayCellClassNames={(arg) => {
                  const clases = ['text-white']
                  const cellDate = arg.date
                  const selectedDate = new Date(diaSeleccionado)
                  if (
                    cellDate.getFullYear() === selectedDate.getFullYear() &&
                    cellDate.getMonth() === selectedDate.getMonth() &&
                    cellDate.getDate() === selectedDate.getDate()
                  ) {
                    clases.push('selected-day')
                  }
                  return clases
                }}
                dayCellContent={(arg) => {
                  const fecha = arg.date.toLocaleDateString('en-CA')
                  const eventosDelDia = eventos.filter(e => e.start === fecha)
                  return (
                    <>
                      <div>{arg.dayNumberText}</div>
                      <div className="calendar-dot-container">
                        {eventosDelDia.map((e, i) => (
                          <div
                            key={i}
                            className="calendar-dot"
                            style={{ backgroundColor: e.color || '#0d6efd' }}
                          />
                        ))}
                      </div>
                    </>
                  )
                }}
                headerToolbar={{
                  left: 'prev',
                  center: 'title',
                  right: 'next'
                }}
                titleFormat={(date) => {
                  const jsDate = date.date.marker as Date;
                  const mes = jsDate.toLocaleString('es-ES', { month: 'long' });
                  const año = jsDate.getFullYear();
                  const mesCapitalizado = mes.charAt(0).toUpperCase() + mes.slice(1);
                  return `${mesCapitalizado} ${año}`;
                }}
              />
            </div>
          </div>

          <div className="col-md-5">
            <div className="bg-dark text-white rounded p-3 shadow mb-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">📅 Eventos del día: {new Date(diaSeleccionado).getDate()}</h5>
                <button className="btn btn-link text-white p-0" onClick={() => abrirModal(null)}>
                  <FontAwesomeIcon icon={faPlus} className="me-1" />
                </button>
              </div>
              {eventosDelDia.length > 0 ? (
                <ul className="mt-2">
                  {eventosDelDia.map(ev => (
                    <li key={ev.id} className="mb-2 d-flex justify-content-between align-items-center">
                      <div>
                        <span
                          className="badge me-2"
                          style={{ backgroundColor: ev.color || '#fff', color: '#000' }}
                        >
                          ●
                        </span>
                        {ev.title}
                      </div>
                      <div className="btn-group">
                        <button className="btn btn-sm btn-outline-light" onClick={() => abrirModal(ev)}>
                          <FontAwesomeIcon icon={faPen} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger ms-2"
                          onClick={() => eliminarEvento(ev.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-white-50 mt-3">No hay eventos para este día.</p>
              )}
            </div>

            <div className="bg-dark text-white rounded p-3 shadow mb-3">
              <h5 className="mb-3">🎓 Clases</h5>
              {clases.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {clases.map(c => (
                    <div key={c.id} className="p-2 rounded bg-secondary bg-opacity-10 text-white border-start border-4" style={{ borderColor: '#0d6efd', backgroundColor: '#0d6efd20'}}>
                      <div className="fw-bold">{c.asignaturas?.nombre}</div>
                      <div className="text-white-50 small">{c.tipo.charAt(0).toUpperCase() + c.tipo.slice(1)} - {c.hora}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white-50">No hay clases este día.</p>
              )}
            </div>

            <div className="bg-dark text-white rounded p-3 shadow">
              <h5 className="mb-3">📝 Tareas</h5>
              {tareas.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {tareas.map(t => (
                    <div key={t.id} className="p-2 rounded bg-secondary bg-opacity-10 text-white border-start border-4" style={{ borderColor: '#0d6efd', backgroundColor: '#0d6efd20'}}>
                      <div className="fw-bold">{t.titulo.charAt(0).toUpperCase() + t.titulo.slice(1)}</div>
                      <div className="text-white-50 small">{t.asignaturas?.nombre}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white-50">No hay tareas para este día.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <ModalEvento
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        evento={eventoEditando}
        fechaPorDefecto={diaSeleccionado}
        onSuccess={() => cargarEventos()}
        userId={userId}
      />
    </div>
  )
}
