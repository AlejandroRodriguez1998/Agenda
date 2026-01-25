import { useEffect, useState } from 'react'
import { db, auth } from '@/lib/firebaseClient'
import { useRouter } from 'next/router'
import TopNav from '@/components/TopNav'
import ModalHorario from '@/components/ModalHorario'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons'
import Swal from 'sweetalert2'
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
  const [usuarioVerificado, setUsuarioVerificado] = useState(false)
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [cargando, setCargando] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [horarioEditando, setHorarioEditando] = useState<Horario | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
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
        await cargarHorarios(user.uid)
      }
    })

    return () => unsubscribe()
  }, [router])

  const cargarHorarios = async (uid: string) => {
    setCargando(true)

    const horariosSnapshot = await getDocs(
      query(collection(db, 'horario'), where('user_id', '==', uid), orderBy('hora', 'asc'))
    )
    const asignaturasSnapshot = await getDocs(
      query(collection(db, 'asignaturas'), where('user_id', '==', uid))
    )

    const asignaturasMap = new Map(
      asignaturasSnapshot.docs.map((docSnap) => [
        docSnap.id,
        { id: docSnap.id, ...(docSnap.data() as { nombre: string; color?: string }) },
      ])
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

    setHorarios(horariosData)
    setCargando(false)
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
      await deleteDoc(doc(db, 'horario', id))
      if (userId) await cargarHorarios(userId)
    }
  }

  const horariosPorDia = diasSemana.reduce((acc, dia) => {
    acc[dia] = horarios.filter((h) => h.dias?.includes(dia))
    return acc
  }, {} as Record<string, Horario[]>)

  const renderHorario = (h: Horario) => (
    <div
      key={h.id}
      className="d-flex justify-content-between align-items-center p-3 rounded text-white mb-2"
      style={{
        backgroundColor: h.asignatura?.color || '#343a40',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      }}
    >
      <div>
        <strong>{h.asignatura?.nombre || 'Asignatura'}</strong>
        <div className="small">{h.tipo.charAt(0).toUpperCase() + h.tipo.slice(1)} · {h.hora}</div>
      </div>
      <div>
        <button
          className="btn btn-sm btn-outline-light me-2"
          onClick={() => {
            setHorarioEditando(h)
            setModalVisible(true)
          }}
        >
          <FontAwesomeIcon icon={faPen} />
        </button>
        <button
          className="btn btn-sm btn-outline-light"
          onClick={() => eliminarHorario(h.id)}
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    </div>
  )

  if (!usuarioVerificado) {
    return <p className="p-4 text-white">Verificando sesión...</p>
  }

  return (
    <>
      <Head>
        <title>Horarios</title>
      </Head>

      <TopNav
        title="🕰️ Horarios"
        onAddClick={() => {
          setHorarioEditando(null)
          setModalVisible(true)
        }}
      />

      <ul className="nav nav-tabs justify-content-center mb-3 small border border-0">
        {['todos', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'].map((dia, idx) => {
          const abreviado = idx === 0 ? 'Todos' : ['L', 'M', 'X', 'J', 'V', 'S', 'D'][idx - 1]
          return (
            <li key={dia} className="nav-item border-bottom">
              <a
                href="#"
                className={`nav-link ${diaSeleccionado === dia ? 'active text-black' : 'text-white'}`}
                onClick={(e) => {
                  e.preventDefault()
                  setDiaSeleccionado(dia)
                }}>
                <>
                  <span className="d-inline d-sm-none">{abreviado}</span>
                  <span className="d-none d-sm-inline">
                    {idx === 0 ? 'Todos' : ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][idx - 1]}
                  </span>
                </>
              </a>
            </li>
          )
        })}
      </ul>

      <div className="container mb-5 pb-5">
        {cargando ? (
          <div className="text-center mt-4">
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : diaSeleccionado === 'todos' ? (
          diasSemana.map((dia) => (
            <div key={dia} className="mb-4">
              <h5 className="text-white fw-bold mb-3 text-capitalize">{dia}</h5>
              {horariosPorDia[dia]?.length > 0 ? (
                horariosPorDia[dia].map(renderHorario)
              ) : (
                <p className="text-white-50">No hay clases.</p>
              )}
            </div>
          ))
        ) : (
          <div className="mb-4">
            {horariosPorDia[diaSeleccionado]?.length > 0 ? (
              horariosPorDia[diaSeleccionado].map(renderHorario)
            ) : (
              <p className="text-white-50">No hay clases.</p>
            )}
          </div>
        )}
      </div>

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
