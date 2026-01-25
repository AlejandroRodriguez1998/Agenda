import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { auth, db } from '@/lib/firebaseClient'
import ModalAsignatura from '@/components/ModalAsignatura'
import TopNav from '@/components/TopNav'
import Swal from 'sweetalert2'
import Head from 'next/head'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { collection, deleteDoc, doc, getDocs, orderBy, query, where } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

type Asignatura = {
  id: string
  nombre: string
  color?: string
  curso: number
}

export default function AsignaturasPage() {
  const router = useRouter()
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([])
  const [cargando, setCargando] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login')
        return
      }

      setUserId(user.uid)
      await cargarAsignaturas(user.uid)
    })

    return () => unsubscribe()
  }, [router])

  const cargarAsignaturas = async (uid: string) => {
    setCargando(true)
    const q = query(
      collection(db, 'asignaturas'),
      where('user_id', '==', uid),
      orderBy('curso', 'asc'),
      orderBy('nombre', 'asc')
    )
    const snapshot = await getDocs(q)
    const data = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Asignatura, 'id'>),
    }))
    setAsignaturas(data)
    setCargando(false)
  }

  const eliminarAsignatura = async (id: string) => {
    const confirmar = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la asignatura y no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })

    if (confirmar.isConfirmed) {
      await deleteDoc(doc(db, 'asignaturas', id))
      if (userId) await cargarAsignaturas(userId)
    }
  }

  const asignaturasPorCurso = asignaturas.reduce((acc, a) => {
    if (!acc[a.curso]) acc[a.curso] = []
    acc[a.curso].push(a)
    return acc
  }, {} as Record<string, Asignatura[]>)

  return (
    <>
      <Head>
        <title>Asignaturas</title>
      </Head>

      <TopNav title="📚 Asignaturas" onAddClick={() => setModalVisible(true)} />

      <div className="container mt-4 mb-5 pb-5">
        {cargando ? (
          <div className="text-center mt-4">
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : Object.keys(asignaturasPorCurso).length === 0 ? (
          <p className="text-white text-center mt-4">No tienes asignaturas.</p>
        ) : (
          Object.entries(asignaturasPorCurso).map(([curso, lista]) => (
            <div key={curso} className="mb-4">
              <h5 className="text-white fw-bold mb-3">{curso}ª curso</h5>
              <ul className="list-group">
                {lista.map((a) => (
                  <li
                    key={a.id}
                    className="list-group-item d-flex justify-content-between align-items-center text-white mb-2"
                    style={{
                      backgroundColor: a.color || '#343a40',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                    }}
                  >
                    <span className="fw-semibold">{a.nombre}</span>
                    <button
                      className="btn btn-sm btn-outline-light"
                      onClick={() => eliminarAsignatura(a.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}

        {userId && (
          <ModalAsignatura
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onSuccess={() => userId && cargarAsignaturas(userId)}
            userId={userId}
          />
        )}
      </div>
    </>
  )
}
