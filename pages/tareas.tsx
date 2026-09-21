import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { auth, db } from '@/lib/firebaseClient'
import ModalTarea from '@/components/ModalTarea'
import AppShell from '@/components/AppShell'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Head from 'next/head'
import { faCheckCircle, faClock, faPen, faTasks, faTrash } from '@fortawesome/free-solid-svg-icons'
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
import { onAuthStateChanged } from 'firebase/auth'

type Tarea = {
  id: string
  titulo: string
  completada: boolean
  created_at: string
  fecha_entrega?: string
  asignatura_id: string
}

type Asignatura = {
  id: string
  nombre: string
  color?: string
  tareas: Tarea[]
}

export default function TareasPage() {
  const router = useRouter()
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([])
  const [cargando, setCargando] = useState(true)
  const [usuarioVerificado, setUsuarioVerificado] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [tareaEditando, setTareaEditando] = useState<Tarea | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/login')
      } else {
        setUserId(user.uid)
        setUsuarioVerificado(true)
        await cargarAsignaturasYtareas(user.uid)
      }
    })

    return () => unsubscribe()
  }, [router])

  const cargarAsignaturasYtareas = async (uid: string) => {
    setCargando(true)
    setError(null)

    try {
      const asignaturasQuery = query(
        collection(db, 'asignaturas'),
        where('user_id', '==', uid),
        orderBy('nombre')
      )
      const asignaturasSnapshot = await getDocs(asignaturasQuery)
      const asignaturasData = asignaturasSnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Asignatura, 'id' | 'tareas'>),
      }))

      const tareasQuery = query(
        collection(db, 'tareas'),
        where('user_id', '==', uid),
        orderBy('created_at', 'desc')
      )
      const tareasSnapshot = await getDocs(tareasQuery)
      const tareasData = tareasSnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Tarea, 'id'>),
      }))

      const asignaturasConTareas: Asignatura[] = asignaturasData
        .map((a) => ({
          ...a,
          tareas: tareasData?.filter((t) => t.asignatura_id === a.id) || [],
        }))
        .filter((a) => a.tareas.length > 0)

      setAsignaturas(asignaturasConTareas)
    } catch (err) {
      const firebaseError = err as { message?: string }
      setError(firebaseError.message || 'No se pudieron cargar las tareas.')
    } finally {
      setCargando(false)
    }
  }

  const cambiarEstado = async (id: string, completada: boolean) => {
    try {
      await updateDoc(doc(db, 'tareas', id), { completada })
      if (userId) await cargarAsignaturasYtareas(userId)
    } catch (err) {
      toast.error('No se pudo actualizar la tarea')
    }
  }

  const eliminarTarea = async (id: string) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'tareas', id))
        toast.success('Tarea eliminada')
        if (userId) await cargarAsignaturasYtareas(userId)
      } catch (err) {
        toast.error('No se pudo eliminar la tarea')
      }
    }
  }

  if (!usuarioVerificado) {
    return <p className="app-state">Verificando sesión...</p>
  }

  const todasLasTareas = asignaturas.flatMap((asignatura) => asignatura.tareas)
  const pendientes = todasLasTareas.filter((tarea) => !tarea.completada).length
  const completadas = todasLasTareas.filter((tarea) => tarea.completada).length

  return (
    <>
      <Head>
        <title>Tareas</title>
      </Head>
      <AppShell title="Tareas" eyebrow="Productividad" onAddClick={() => {
        setTareaEditando(null)
        setModalVisible(true)
      }}>
      <main className="academic-page">
        <section className="metric-grid">
          <article className="metric-card">
            <FontAwesomeIcon icon={faClock} />
            <div><strong>{pendientes}</strong><span>Pendientes</span></div>
          </article>
          <article className="metric-card">
            <FontAwesomeIcon icon={faCheckCircle} />
            <div><strong>{completadas}</strong><span>Completadas</span></div>
          </article>
          <article className="metric-card">
            <FontAwesomeIcon icon={faTasks} />
            <div><strong>{asignaturas.length}</strong><span>Asignaturas con tareas</span></div>
          </article>
        </section>

        {error && <div className="error-panel"><strong>No se pudieron cargar las tareas</strong><p>{error}</p></div>}
        {cargando ? (
          <div className="app-state">Cargando tareas...</div>
        ) : asignaturas.length === 0 ? (
          <div className="empty-panel">No tienes tareas aún.</div>
        ) : (
          <section className="stack-list">
            {asignaturas.map((asignatura) => (
              <article key={asignatura.id} className="page-card" style={{ '--item-color': asignatura.color || '#6c8cff' } as React.CSSProperties}>
                <div className="card-heading">
                  <div>
                    <span className="color-dot" />
                    <h2>{asignatura.nombre}</h2>
                  </div>
                  <span>{asignatura.tareas.filter((tarea) => !tarea.completada).length} pendientes</span>
                </div>

                <div className="task-page-list">
                  {asignatura.tareas.map((tarea) => (
                    <div key={tarea.id} className={`task-page-row ${tarea.completada ? 'is-done' : ''}`}>
                      <label>
                        <input type="checkbox" checked={tarea.completada} onChange={(e) => cambiarEstado(tarea.id, e.target.checked)} />
                        <span>{tarea.titulo}</span>
                      </label>
                      {tarea.fecha_entrega && (
                        <time>{new Date(`${tarea.fecha_entrega}T12:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</time>
                      )}
                      <div className="row-actions">
                        <button onClick={() => {
                          setTareaEditando(tarea)
                          setModalVisible(true)
                        }} aria-label="Editar tarea">
                          <FontAwesomeIcon icon={faPen} />
                        </button>
                        <button onClick={() => eliminarTarea(tarea.id)} aria-label="Eliminar tarea">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </section>
        )}

        {userId && (
          <ModalTarea
            visible={modalVisible}
            tarea={tareaEditando
              ? {
                id: tareaEditando.id,
                titulo: tareaEditando.titulo,
                fecha_entrega: tareaEditando.fecha_entrega ?? '',
                asignatura_id: tareaEditando.asignatura_id,
              }
              : undefined}
            onClose={() => setModalVisible(false)}
            onSuccess={() => userId && cargarAsignaturasYtareas(userId)}
            userId={userId}
          />
        )}
      </main>
      </AppShell>
    </>
  )
}
