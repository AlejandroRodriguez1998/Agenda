// pages/notas.tsx

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { auth, db } from '@/lib/firebaseClient'
import AppShell from '@/components/AppShell'
import ModalNota from '@/components/ModalNota'
import Swal from 'sweetalert2'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Head from 'next/head'
import { faChartLine, faGraduationCap, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
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
  const [error, setError] = useState<string | null>(null)

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
    setError(null)

    try {
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
    } catch (err) {
      const firebaseError = err as { message?: string }
      setError(firebaseError.message || 'No se pudieron cargar las notas.')
    } finally {
      setCargando(false)
    }
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
      try {
        await deleteDoc(doc(db, 'notas_academicas', id))
        if (userId) await cargarAsignaturasYNotas(userId)
      } catch (err) {
        toast.error('No se pudo eliminar la nota')
      }
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

  const cursos = [1, 2, 3, 4]
  const progresoPorCurso = cursos.map((curso) => {
    const asignaturasCurso = asignaturas.filter((a) => a.curso === curso)
    const total = asignaturasCurso.length
    const conNota = asignaturasCurso.filter((a) => (notasPorAsignatura[a.id] || []).length > 0).length
    return {
      curso,
      total,
      conNota,
      progreso: total > 0 ? conNota / total : 0,
    }
  })

  const asignaturaSeleccionada = seleccionada
    ? asignaturas.find((asignatura) => asignatura.id === seleccionada)
    : null

  const abrirDetalleAsignatura = (asignaturaId: string) => {
    setSeleccionada(asignaturaId)
    setNotas(notasPorAsignatura[asignaturaId] || [])
  }

  const cerrarDetalleAsignatura = () => {
    setSeleccionada(null)
    setNotas([])
    setModalVisible(false)
  }

  return (
    <>
      <Head>
        <title>Notas</title>
      </Head>
      <AppShell title="Notas" eyebrow="Rendimiento" showAdd={false}>
      <main className="academic-page">
        <section className="metric-grid">
          <article className="metric-card">
            <FontAwesomeIcon icon={faChartLine} />
            <div><strong>{mediaGlobal || '-'}</strong><span>Media global</span></div>
          </article>
          <article className="metric-card">
            <FontAwesomeIcon icon={faGraduationCap} />
            <div><strong>{notasFinales.length}</strong><span>Asignaturas evaluadas</span></div>
          </article>
        </section>

        {error && <div className="error-panel"><strong>No se pudieron cargar las notas</strong><p>{error}</p></div>}
        {cargando ? (
          <div className="app-state">Cargando notas...</div>
        ) : (
          <>
            {mediaGlobal ? (
              <section className="page-card grade-summary">
                <div className="grade-gauge">
                  <svg width="220" height="140" viewBox="0 0 220 140" style={{ display: 'block', margin: '0 auto' }}>
                    {(() => {
                      const cx = 110
                      const cy = 120
                      const stroke = 10
                      const gap = 6
                      const baseRadius = 56
                      const colors = ['#ff4d4f', '#fadb14', '#52c41a', '#1677ff']
                      const half = Math.PI
                      return progresoPorCurso.map((item, i) => {
                        const orderIndex = (progresoPorCurso.length - 1) - i
                        const r = baseRadius + orderIndex * (stroke + gap)
                        const circumference = 2 * Math.PI * r
                        const halfCirc = circumference * 0.5
                        const dashProgress = `${halfCirc * item.progreso} ${circumference}`
                        return (
                          <g key={item.curso}>
                            <circle
                              cx={cx}
                              cy={cy}
                              r={r}
                              fill="none"
                              stroke="rgba(255,255,255,0.12)"
                              strokeWidth={stroke}
                              strokeDasharray={`${halfCirc} ${circumference}`}
                              transform={`rotate(180 ${cx} ${cy})`}
                            />
                            <circle
                              cx={cx}
                              cy={cy}
                              r={r}
                              fill="none"
                              stroke={colors[i]}
                              strokeWidth={stroke}
                              strokeLinecap="round"
                              strokeDasharray={dashProgress}
                              transform={`rotate(180 ${cx} ${cy})`}
                              style={{ filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.35))' }}
                            />
                          </g>
                        )
                      })
                    })()}
                  </svg>
                  <div>
                    {mediaGlobal}
                  </div>
                </div>
                <h2>Media global de todas las asignaturas</h2>
                <div className="course-legend">
                  {progresoPorCurso.map((item, idx) => (
                    <div key={item.curso}>
                      <span style={{ color: ['#ff4d4f', '#fadb14', '#52c41a', '#1677ff'][idx] }}>●</span>{' '}
                      {item.curso}º: {item.conNota}/{item.total}
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <div className="empty-panel">No hay notas aún.</div>
            )}

            <section className="stack-list">
              {Object.entries(notasPorCurso)
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([curso, lista]) => (
                <article key={curso} className="page-card">
                  <div className="card-heading">
                    <div>
                      <span className="soft-icon"><FontAwesomeIcon icon={faGraduationCap} /></span>
                      <h2>{curso}º curso</h2>
                    </div>
                    <span>{lista.length} medias</span>
                  </div>
                  <div className="grade-course-list">
                  {lista.map(({ asignatura, final }) => (
                    <button
                      key={asignatura.id}
                      className="grade-course-row"
                      style={{ '--item-color': asignatura.color || '#6c8cff' } as React.CSSProperties}
                      onClick={() => abrirDetalleAsignatura(asignatura.id)}
                    >
                      <span className="color-dot" />
                      <strong>{asignatura.nombre}</strong>
                      <b>{final.toFixed(2)}</b>
                    </button>
                  ))}
                  </div>
                </article>
              ))}
            </section>
          </>
        )}

        {asignaturaSeleccionada && !modalVisible && (
          <div className="grade-modal-backdrop" onClick={cerrarDetalleAsignatura}>
            <section
              className="grade-modal"
              style={{ '--item-color': asignaturaSeleccionada.color || '#6c8cff' } as React.CSSProperties}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="grade-modal__header">
                <div className="grade-detail-head">
                  <div className="grade-score">
                    {notas.length ? calcularNotaFinal(notas).toFixed(2) : '-'}
                  </div>
                  <div>
                    <h2>{asignaturaSeleccionada.nombre}</h2>
                    <p>Total ponderado registrado: {notas.reduce((acc, n) => acc + n.peso, 0)}%</p>
                  </div>
                </div>
                <button onClick={cerrarDetalleAsignatura} aria-label="Cerrar">×</button>
              </div>

              {notas.length === 0 ? (
                <div className="empty-panel">No hay notas aún.</div>
              ) : (
                <div className="grade-list">
                  {notas.map((n) => (
                    <div key={n.id} className="grade-row">
                      <div>
                        <strong>{n.tipo}</strong>
                        <span>Peso: {n.peso}%</span>
                      </div>
                      <div className="row-actions">
                        <b>{n.nota}</b>
                        <button onClick={() => eliminarNota(n.id)} aria-label="Eliminar nota">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button className="grade-modal__add" onClick={() => setModalVisible(true)}>
                <FontAwesomeIcon icon={faPlus} />
                Añadir nota
              </button>
            </section>
          </div>
        )}

        {userId && seleccionada && (
          <ModalNota
            visible={modalVisible}
            asignaturaId={seleccionada}
            onClose={() => setModalVisible(false)}
            onSuccess={() => userId && cargarAsignaturasYNotas(userId)}
            userId={userId}
          />
        )}
      </main>
      </AppShell>
    </>
  )
}
