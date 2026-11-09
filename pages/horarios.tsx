import { useEffect, useState } from 'react'
import { db, auth } from '@/lib/firebaseClient'
import { useRouter } from 'next/router'
import AppShell from '@/components/AppShell'
import { useEstudio } from '@/components/EstudioContext'
import ModalHorario from '@/components/ModalHorario'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarDays, faClock, faPen, faTrash } from '@fortawesome/free-solid-svg-icons'
import Swal from 'sweetalert2'
import toast from 'react-hot-toast'
import Head from 'next/head'
import { collection, deleteDoc, doc, getDocs, orderBy, query, where } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

type Horario = {
  id: string
  asignatura_id: string
  tipo: 'teórica' | 'laboratorio'
  hora: string
  dias: string[]
  asignatura?: {
    id: string
    nombre: string
    color?: string
  }
}

const diasSemana = [
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
  'domingo',
]

export default function HorariosPage() {
  const router = useRouter()
  const { estudioId, esDelEstudioActivo } = useEstudio()
  const [usuarioVerificado, setUsuarioVerificado] = useState(false)
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [cargando, setCargando] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [horarioEditando, setHorarioEditando] = useState<Horario | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [diaSeleccionado, setDiaSeleccionado] = useState<string>(() => {
    const hoy = new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase()
    return diasSemana.includes(hoy) ? hoy : 'todos'
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login')
      } else {
        setUserId(user.uid)
        setUsuarioVerificado(true)
      }
    })

    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    if (userId && estudioId) cargarHorarios(userId)
  }, [userId, estudioId])

  const cargarHorarios = async (uid: string) => {
    setCargando(true)
    setError(null)

    try {
      const horariosSnapshot = await getDocs(
        query(collection(db, 'horario'), where('user_id', '==', uid), orderBy('hora', 'asc'))
      )
      const asignaturasSnapshot = await getDocs(
        query(collection(db, 'asignaturas'), where('user_id', '==', uid))
      )

      const asignaturasMap = new Map(
        asignaturasSnapshot.docs
          .map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as { nombre: string; color?: string; estudio_id?: string }) }))
          .filter(esDelEstudioActivo)
          .map((asignatura) => [asignatura.id, asignatura])
      )

      const horariosData = horariosSnapshot.docs.map((docSnap) => {
        const data = docSnap.data() as { asignatura_id: string; tipo: 'teórica' | 'laboratorio'; hora: string; dias: string[] }
        const asignatura = asignaturasMap.get(data.asignatura_id)
        return {
          id: docSnap.id,
          asignatura_id: data.asignatura_id,
          tipo: data.tipo,
          hora: data.hora,
          dias: data.dias,
          asignatura,
        }
      })

      setHorarios(horariosData.filter((h) => asignaturasMap.has(h.asignatura_id)))
    } catch (err) {
      const firebaseError = err as { message?: string }
      setError(firebaseError.message || 'No se pudieron cargar los horarios.')
    } finally {
      setCargando(false)
    }
  }

  const eliminarHorario = async (id: string) => {
    const confirmar = await Swal.fire({
      title: '¿Eliminar horario?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar',
    })

    if (confirmar.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'horario', id))
        if (userId) await cargarHorarios(userId)
      } catch (err) {
        toast.error('No se pudo eliminar el horario')
      }
    }
  }

  const horariosPorDia = diasSemana.reduce((acc, dia) => {
    acc[dia] = horarios.filter((h) => h.dias?.includes(dia))
    return acc
  }, {} as Record<string, Horario[]>)

  const renderHorario = (h: Horario) => (
    <div
      key={h.id}
      className="schedule-row"
      style={{ '--item-color': h.asignatura?.color || '#6c8cff' } as React.CSSProperties}
    >
      <div>
        <span className="color-dot" />
        <strong>{h.asignatura?.nombre || 'Asignatura'}</strong>
        <p>{h.tipo.charAt(0).toUpperCase() + h.tipo.slice(1)} · {h.hora}</p>
      </div>
      <div className="row-actions">
        <button
          onClick={() => {
            setHorarioEditando(h)
            setModalVisible(true)
          }}
          aria-label="Editar horario"
        >
          <FontAwesomeIcon icon={faPen} />
        </button>
        <button
          onClick={() => eliminarHorario(h.id)}
          aria-label="Eliminar horario"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    </div>
  )

  if (!usuarioVerificado) {
    return <p className="app-state">Verificando sesión...</p>
  }

  return (
    <>
      <Head>
        <title>Horario</title>
      </Head>

      <AppShell title="Horario" eyebrow="Agenda académica" onAddClick={() => {
        setHorarioEditando(null)
        setModalVisible(true)
      }}>
      <main className="academic-page">
        <section className="metric-grid">
          <article className="metric-card">
            <FontAwesomeIcon icon={faCalendarDays} />
            <div><strong>{horarios.length}</strong><span>Bloques semanales</span></div>
          </article>
          <article className="metric-card">
            <FontAwesomeIcon icon={faClock} />
            <div><strong>{diasSemana.filter((dia) => horariosPorDia[dia]?.length).length}</strong><span>Días con clase</span></div>
          </article>
        </section>

        <div className="filter-chips">
          {['todos', ...diasSemana].map((dia, idx) => (
            <button
              key={dia}
              className={diaSeleccionado === dia ? 'is-active' : ''}
              onClick={() => setDiaSeleccionado(dia)}
            >
              {idx === 0 ? 'Todos' : dia.charAt(0).toUpperCase() + dia.slice(1)}
            </button>
          ))}
        </div>

        {error && <div className="error-panel"><strong>No se pudieron cargar los horarios</strong><p>{error}</p></div>}
        {cargando ? (
          <div className="app-state">Cargando horario...</div>
        ) : diaSeleccionado === 'todos' ? (
          <section className="stack-list">
            {diasSemana.map((dia) => (
              <article key={dia} className="page-card">
                <div className="card-heading">
                  <div>
                    <span className="soft-icon"><FontAwesomeIcon icon={faCalendarDays} /></span>
                    <h2>{dia}</h2>
                  </div>
                  <span>{horariosPorDia[dia]?.length || 0} bloques</span>
                </div>
              {horariosPorDia[dia]?.length > 0 ? (
                horariosPorDia[dia].map(renderHorario)
              ) : (
                <p className="empty-inline">No hay clases.</p>
              )}
              </article>
            ))}
          </section>
        ) : (
          <section className="page-card">
            {horariosPorDia[diaSeleccionado]?.length > 0 ? (
              horariosPorDia[diaSeleccionado].map(renderHorario)
            ) : (
              <p className="empty-inline">No hay clases.</p>
            )}
          </section>
        )}
      </main>
      </AppShell>

      {userId && (
        <ModalHorario
          visible={modalVisible}
          horario={horarioEditando}
          onClose={() => setModalVisible(false)}
          onSuccess={() => userId && cargarHorarios(userId)}
          userId={userId}
        />
      )}
    </>
  )
}
