import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import TopNav from '@/components/TopNav'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'
import Link from 'next/link'
import Head from 'next/head'
import ModalEvento from '@/components/ModalEvento'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons'

type Evento = {
  id: string
  title: string
  start: string
  color: string
}

export default function InicioPage() {
  const router = useRouter()
  const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(null)
  const [eventos, setEventos] = useState<Evento[]>([])
  const [diaSeleccionado, setDiaSeleccionado] = useState<string>(new Date().toISOString().split('T')[0])
  const [cargando, setCargando] = useState(true)
  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('showLogoutToast') === 'true') {
      localStorage.removeItem('showLogoutToast')
      toast.success('Hasta luego 👋', {
        style: { background: '#1a1a1a', color: '#fff' }
      })
    }

    const obtenerUsuario = async () => {
      const { data } = await supabase.auth.getSession()
      const user = data.session?.user
      setUser(user ?? null)

      if (user) {
        await cargarEventos(user.id)
      }
    }

    obtenerUsuario()
  }, [])

  const cargarEventos = async (userId: string) => {
    setCargando(true)
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('user_id', userId)

    if (data) setEventos(data as Evento[])
    setCargando(false)
  }

  const eventosDelDia = eventos.filter((e) => {
    const fechaEvento = typeof e.start === 'string'
      ? e.start.split('T')[0]
      : new Date(e.start).toISOString().split('T')[0]

    return fechaEvento === diaSeleccionado
  })

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
      if (user) await cargarEventos(user.id)
      toast.success('Evento eliminado', {
        style: { background: '#1a1a1a', color: '#fff' }
      })
    }
  }

  return (
    <>
      <Head>
        <title>Agenda Escolar</title>
      </Head>

      {user && <TopNav title="🏠 Inicio" customRightIcon="logout" onRightClick={async () => {
        await supabase.auth.signOut()
        localStorage.setItem('showLogoutToast', 'true')
        router.push('/').then(() => router.reload())
      }} />}

      {user ? (
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

                      const mismaFecha =
                        cellDate.getFullYear() === selectedDate.getFullYear() &&
                        cellDate.getMonth() === selectedDate.getMonth() &&
                        cellDate.getDate() === selectedDate.getDate()

                      if (mismaFecha) {
                        clases.push('selected-day')
                      }

                      return clases
                    }}
                    headerToolbar={{
                      left: 'prev,next',
                      center: 'title',
                      right: 'today,dayGridWeek,dayGridMonth'
                    }}
                  />
                </div>
              </div>

              <div className="col-md-5">
                <div className="bg-dark text-white rounded p-3 shadow">
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
                            <span className="badge me-2" style={{ backgroundColor: ev.color || '#fff', color: '#000' }}>●</span>
                            {ev.title}
                          </div>
                          <div className="btn-group">
                            <button className="btn btn-sm btn-outline-light" onClick={() => abrirModal(ev)}>
                              <FontAwesomeIcon icon={faPen} />
                            </button>
                            <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => eliminarEvento(ev.id)}>
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
              </div>
            </div>
          )}

          <ModalEvento
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            evento={eventoEditando}
            fechaPorDefecto={diaSeleccionado}
            onSuccess={() => user && cargarEventos(user.id)}
            userId={user.id}
          />

        </div>
      ) : (
        <div style={{ minHeight: '100vh', color: 'white' }}>
          {/* HERO */}
          <div className="container py-5 d-flex flex-column justify-content-center align-items-center text-center">
            <h1 className="display-4 mb-3">👋 Bienvenido a tu Agenda Escolar</h1>
            <p className="lead mb-4">
              Organiza fácilmente tus tareas, exámenes y asignaturas desde un solo lugar.
            </p>
            <div className="d-flex gap-3 flex-wrap justify-content-center mb-5">
              <Link href="/login" className="btn btn-light btn-lg px-4">Iniciar sesión</Link>
            </div>
          </div>

          {/* FUNCIONALIDADES */}
          <div className="container pb-5">
            <div className="row g-4">
              <div className="col-md-4">
                <div className="bg-dark text-white rounded p-4 h-100 shadow">

                  <h4>📝 Gestiona tus tareas</h4>
                  <p className="mt-2">Añade, marca como completadas y organiza tus tareas por asignatura.</p>

                </div>
              </div>
              <div className="col-md-4">
                <div className="bg-dark text-white rounded p-4 h-100 shadow">

                  <h4>📚 Organiza tus asignaturas</h4>
                  <p className="mt-2">Crea asignaturas y asigna colores para identificarlas rápidamente.</p>

                </div>
              </div>
              <div className="col-md-4">
                <div className="bg-dark text-white rounded p-4 h-100 shadow">

                  <h4>📊 Calcula tus notas</h4>
                  <p className="mt-2">Introduce tus calificaciones, pesos y visualiza tu media global.</p>

                </div>
              </div>
            </div>
          </div>

          {/* CIERRE */}
          <div className="text-center pb-5">
            <p className="text-white-50 fst-italic">✨ Empieza ahora a tener tu vida académica bajo control. ¡Tu yo del futuro te lo agradecerá!</p>
          </div>
        </div>
      )}
    </>
  )
}
