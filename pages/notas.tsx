// pages/notas.tsx

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { auth, db } from '@/lib/firebaseClient'
import TopNav from '@/components/TopNav'
import ModalNota from '@/components/ModalNota'
import Swal from 'sweetalert2'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Head from 'next/head'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

type Asignatura = {
  id: string
  nombre: string
  color: string
  curso: number
}

type Nota = {
  id: string
  tipo: string
  nota: number
  peso: number
  created_at: string
  asignatura_id: string
}

export default function NotasPage() {
  const router = useRouter()
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([])
  const [seleccionada, setSeleccionada] = useState<string | null>(null)
  const [notas, setNotas] = useState<Nota[]>([])
  const [notasPorAsignatura, setNotasPorAsignatura] = useState<Record<string, Nota[]>>({})
  const [cargando, setCargando] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login')
      } else {
        setUserId(user.uid)
        await cargarAsignaturasYNotas(user.uid)
      }
    })

    return () => unsubscribe()
  }, [router])

  const cargarAsignaturasYNotas = async (uid: string) => {
    setCargando(true)

    const asignaturasSnapshot = await getDocs(
      query(
        collection(db, 'asignaturas'),
        where('user_id', '==', uid),
        orderBy('curso', 'asc'),
        orderBy('nombre', 'asc')
      )
    )
    const asignaturasData = asignaturasSnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Asignatura, 'id'>),
    }))

    const notasSnapshot = await getDocs(
      query(
        collection(db, 'notas_academicas'),
        where('user_id', '==', uid),
        orderBy('created_at', 'asc')
      )
    )
    const notasData = notasSnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Nota, 'id'>),
    }))

    setAsignaturas(asignaturasData)

    const agrupadas = asignaturasData.reduce((acc, asignatura) => {
      acc[asignatura.id] = notasData.filter(n => n.asignatura_id === asignatura.id)
      return acc
    }, {} as Record<string, Nota[]>)

    setNotasPorAsignatura(agrupadas)

    if (seleccionada) {
      setNotas(agrupadas[seleccionada] || [])
    }

    setCargando(false)
  }

  const cargarNotas = async (uid: string, asignaturaId: string) => {
    setCargando(true)
    const snapshot = await getDocs(
      query(
        collection(db, 'notas_academicas'),
        where('user_id', '==', uid),
        where('asignatura_id', '==', asignaturaId),
        orderBy('created_at', 'asc')
      )
    )

    const data = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Nota, 'id'>),
    }))

    setNotas(data)
    setCargando(false)
  }

  const eliminarNota = async (id: string) => {
    const confirmar = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })

    if (confirmar.isConfirmed) {
      await deleteDoc(doc(db, 'notas_academicas', id))
      if (userId) await cargarAsignaturasYNotas(userId)
    }
  }

  const calcularNotaFinal = (notas: Nota[]) => {
    const pesoTotal = notas.reduce((acc, n) => acc + n.peso, 0)
    if (pesoTotal === 0) return 0
    return notas.reduce((acc, n) => acc + n.nota * (n.peso / 100), 0)
  }

  const notasFinales = asignaturas.map((a) => {
    const notas = notasPorAsignatura[a.id] || []
    return {
      asignatura: a,
      final: calcularNotaFinal(notas),
    }
  }).filter(n => n.final > 0)

  const notasPorCurso = notasFinales.reduce((acc, nota) => {
    const curso = nota.asignatura.curso
    if (!acc[curso]) acc[curso] = []
    acc[curso].push(nota)
    return acc
  }, {} as Record<string, { asignatura: Asignatura; final: number }[]>)

  const mediaGlobal =
    notasFinales.length > 0
      ? (notasFinales.reduce((acc, n) => acc + n.final, 0) / notasFinales.length).toFixed(2)
      : null

  const totalAsignaturas = asignaturas.length
  const asignaturasConNota = notasFinales.length
  const progresoAsignaturas =
    totalAsignaturas > 0 ? asignaturasConNota / totalAsignaturas : 0

  const asignaturasPorCurso = asignaturas.reduce((acc, a) => {
    if (!acc[a.curso]) acc[a.curso] = []
    acc[a.curso].push(a)
    return acc
  }, {} as Record<string, Asignatura[]>)

  return (
    <>
      <Head>
        <title>Notas</title>
      </Head>
      <TopNav title="📊 Notas" showAdd={!!seleccionada} onAddClick={() => setModalVisible(true)} />

      <div className="container mt-3 mb-5 pb-5">
        <div className="mb-4">
          <select className="form-select" onChange={(e) => {
            setSeleccionada(e.target.value)
            if (e.target.value && userId) cargarNotas(userId, e.target.value)
          }} value={seleccionada || ''}>
            <option value="">Selecciona una asignatura</option>
            {Object.entries(asignaturasPorCurso).map(([curso, lista]) => (
              <optgroup key={curso} label={`${curso}ª curso`}>
                {lista.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {cargando ? (
          <div className="text-center mt-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : seleccionada ? (
          <>
            {notas.length === 0 ? (
              <p className="text-white text-center">No hay notas aún.</p>
            ) : (
              <div
                className="p-3 rounded shadow-sm d-flex flex-column gap-3"
                style={{
                  backgroundColor: '#1e1e1e',
                  border: '1px solid #333',
                }}
              >
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      backgroundColor:
                        asignaturas.find((a) => a.id === seleccionada)?.color || '#0d6efd',
                      color: 'white',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontWeight: 'bold',
                      fontSize: '1.2rem',
                    }}
                  >
                    {calcularNotaFinal(notas).toFixed(2)}
                  </div>
                  <div className="text-white">
                    <div className="fw-bold">
                      {asignaturas.find((a) => a.id === seleccionada)?.nombre}
                    </div>
                    <div className="text-white-50">
                      Total: {notas.reduce((acc, n) => acc + n.peso, 0)}%
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-column gap-2">
                  {notas.map((n) => (
                    <div
                      key={n.id}
                      className="d-flex justify-content-between align-items-center px-2 py-2 rounded"
                      style={{ backgroundColor: '#2a2a2a' }}
                    >
                      <div>
                        <div className="fw-bold text-white">{n.tipo}</div>
                        <div className="text-white-50 small">Peso: {n.peso}%</div>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <div className="fs-6 fw-bold text-white">{n.nota}</div>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => eliminarNota(n.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {userId && (
              <ModalNota
                visible={modalVisible}
                asignaturaId={seleccionada}
                onClose={() => setModalVisible(false)}
                onSuccess={() => userId && cargarAsignaturasYNotas(userId)}
                userId={userId}
              />
            )}
          </>
        ) : (
          <>
            {mediaGlobal ? (
              <div className="text-center mb-4">
                <div
                  style={{
                    width: 140,
                    height: 140,
                    borderRadius: '50%',
                    padding: 6,
                    margin: '0 auto 1rem',
                    background: `conic-gradient(from -90deg,
                      #ff4d4f 0%,
                      #ff7a45 16%,
                      #fadb14 33%,
                      #52c41a 50%,
                      #13c2c2 66%,
                      #1677ff 83%,
                      #9254de 100%)`,
                    position: 'relative',
                    opacity: progresoAsignaturas > 0 ? 1 : 0.35,
                    clipPath: `polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)`,
                    maskImage: `conic-gradient(#000 0deg ${progresoAsignaturas * 360}deg, transparent ${progresoAsignaturas * 360}deg)`,
                    WebkitMaskImage: `conic-gradient(#000 0deg ${progresoAsignaturas * 360}deg, transparent ${progresoAsignaturas * 360}deg)`,
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      backgroundColor: '#0d6efd',
                      color: 'white',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontSize: 28,
                      fontWeight: 'bold',
                      boxShadow: '0 0 20px rgba(13,110,253,0.35)',
                    }}
                  >
                    {mediaGlobal}
                  </div>
                </div>
                <p className="text-white">Media global de todas las asignaturas</p>
                <p className="text-white-50 small mb-0">
                  Progreso: {asignaturasConNota}/{totalAsignaturas} con nota
                </p>
              </div>
            ) : (
              <p className="text-white text-center">No hay notas aún.</p>
            )}

            {Object.entries(notasPorCurso)
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([curso, lista]) => (
                <div key={curso} className="mb-3">
                  <h5 className="text-white fw-bold mb-2">{curso}ª curso</h5>
                  {lista.map(({ asignatura, final }) => (
                    <div
                      key={asignatura.id}
                      className="d-flex justify-content-between align-items-center mb-2 text-white p-3 rounded"
                      style={{ backgroundColor: asignatura.color || '#343a40' }}
                    >
                      <strong>{asignatura.nombre}</strong>
                      <span className="badge bg-light text-dark">{final.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ))}
          </>
        )}
      </div>
    </>
  )
}
