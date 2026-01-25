import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { auth, db } from '@/lib/firebaseClient'
import ModalTarea from '@/components/ModalTarea'
import TopNav from '@/components/TopNav'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Head from 'next/head'
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons'
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
    setCargando(false)
  }

  const cambiarEstado = async (id: string, completada: boolean) => {
    await updateDoc(doc(db, 'tareas', id), { completada })
    if (userId) await cargarAsignaturasYtareas(userId)
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
      await deleteDoc(doc(db, 'tareas', id))
      toast.success('Tarea eliminada', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
        },
      })
      if (userId) await cargarAsignaturasYtareas(userId)
    }
  }

  if (!usuarioVerificado) {
    return <p className="p-4">Verificando sesión...</p>
  }

  return (
    <>
      <Head>
        <title>Tareas</title>
      </Head>
      <TopNav title="👋 Tareas" onAddClick={() => {
        setTareaEditando(null)
        setModalVisible(true)
      }} />
      <div className="container mt-3 mb-5 pb-5">
        {cargando ? (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : asignaturas.length === 0 ? (
          <p className="text-white text-center">No tienes tareas aún.</p>
        ) : (
          asignaturas.map((asignatura) => (
            <div key={asignatura.id} className="mb-4 p-4 rounded text-white" style={{backgroundColor: asignatura.color || '#343a40', boxShadow: '0 2px 6px rgba(0,0,0,0.3)',}}>
              <h5 className="mb-3">{asignatura.nombre}</h5>

              {asignatura.tareas.map((tarea) => (
                <div key={tarea.id} className="d-flex justify-content-between align-items-start mb-2">
                  <div className="form-check">
                    <input className="form-check-input me-2" type="checkbox" checked={tarea.completada} onChange={(e) => cambiarEstado(tarea.id, e.target.checked)} />
                    <label className={`form-check-label ${tarea.completada ? 'text-decoration-line-through text-muted' : ''}`}>
                      {tarea.titulo}
                    </label>
                    {tarea.fecha_entrega && (
                      <div className="small mt-1 text-light">
                        📅 {new Date(tarea.fecha_entrega).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="button-group">
                    <button className="btn btn-sm btn-outline-light" onClick={() => {
                      setTareaEditando(tarea)
                      setModalVisible(true)
                    }}>
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button className="btn btn-sm btn-outline-light ms-1" onClick={() => eliminarTarea(tarea.id)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))
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
      </div>
    </>
  )
}
