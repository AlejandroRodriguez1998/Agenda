import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { auth, db } from '@/lib/firebaseClient'
import ModalAsignatura from '@/components/ModalAsignatura'
import AppShell from '@/components/AppShell'
import { useEstudio } from '@/components/EstudioContext'
import Swal from 'sweetalert2'
import toast from 'react-hot-toast'
import Head from 'next/head'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen, faLayerGroup, faTrash } from '@fortawesome/free-solid-svg-icons'
import { collection, deleteDoc, doc, getDocs, orderBy, query, where } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

type Asignatura = {
  id: string
  nombre: string
  color?: string
  curso: number
  estudio_id?: string
}

export default function AsignaturasPage() {
  const router = useRouter()
  const { estudioId, estudioActivo, esDelEstudioActivo } = useEstudio()
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([])
  const [cargando, setCargando] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login')
        return
      }

      setUserId(user.uid)
    })

    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    if (userId && estudioId) cargarAsignaturas(userId)
  }, [userId, estudioId])

  const cargarAsignaturas = async (uid: string) => {
    setCargando(true)
    setError(null)
    try {
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
      setAsignaturas(data.filter(esDelEstudioActivo))
    } catch (err) {
      const firebaseError = err as { message?: string }
      setError(firebaseError.message || 'No se pudieron cargar las asignaturas.')
    } finally {
      setCargando(false)
    }
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
      try {
        await deleteDoc(doc(db, 'asignaturas', id))
        if (userId) await cargarAsignaturas(userId)
      } catch (err) {
        toast.error('No se pudo eliminar la asignatura')
      }
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

      <AppShell title="Asignaturas" eyebrow="Plan académico" onAddClick={() => setModalVisible(true)}>
      <main className="academic-page subjects-page">
        <section className="metric-grid">
          <article className="metric-card">
            <FontAwesomeIcon icon={faBookOpen} />
            <div><strong>{asignaturas.length}</strong><span>Asignaturas</span></div>
          </article>
          <article className="metric-card">
            <FontAwesomeIcon icon={faLayerGroup} />
            <div><strong>{Object.keys(asignaturasPorCurso).length}</strong><span>Cursos activos</span></div>
          </article>
        </section>

        {error && <div className="error-panel"><strong>No se pudieron cargar las asignaturas</strong><p>{error}</p></div>}
        {cargando ? (
          <div className="app-state">Cargando asignaturas...</div>
        ) : Object.keys(asignaturasPorCurso).length === 0 ? (
          <div className="empty-panel">No tienes asignaturas en {estudioActivo?.nombre ?? 'este estudio'}.</div>
        ) : (
          <section className="stack-list subjects-stack">
            {Object.entries(asignaturasPorCurso).map(([curso, lista]) => (
              <article key={curso} className="page-card">
                <div className="card-heading">
                  <div>
                    <span className="soft-icon"><FontAwesomeIcon icon={faLayerGroup} /></span>
                    <h2>{curso}º curso</h2>
                  </div>
                  <span>{lista.length} asignatura{lista.length === 1 ? '' : 's'}</span>
                </div>
                <div className="subject-list-compact">
                {lista.map((a) => (
                  <div
                    key={a.id}
                    className="subject-list-row"
                    style={{ '--item-color': a.color || '#6c8cff' } as React.CSSProperties}
                  >
                    <span className="color-dot" />
                    <div>
                      <strong>{a.nombre}</strong>
                      <small>{a.curso}º curso</small>
                    </div>
                    <button
                      onClick={() => eliminarAsignatura(a.id)}
                      aria-label="Eliminar asignatura"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))}
                </div>
              </article>
            ))}
          </section>
        )}

        {userId && (
          <ModalAsignatura
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onSuccess={() => userId && cargarAsignaturas(userId)}
            userId={userId}
          />
        )}
      </main>
      </AppShell>
    </>
  )
}
