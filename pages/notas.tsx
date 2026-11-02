import { useState } from 'react'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartColumn, faPen, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { deleteDoc, doc } from 'firebase/firestore'
import AppShell, { EmptyState, Skeleton } from '@/components/AppShell'
import Modal from '@/components/Modal'
import ModalNota from '@/components/ModalNota'
import { useAuth } from '@/lib/auth'
import { useData } from '@/lib/data'
import { db } from '@/lib/firebaseClient'
import { calcularNotaFinal, formatNota, gradeTone, mediaEvaluada, pesoEvaluado } from '@/lib/grades'
import type { Asignatura, Nota } from '@/lib/types'
import { confirmar, notifyError } from '@/lib/ui'

const COLORES_CURSO = ['#ff4d4f', '#fadb14', '#52c41a', '#1677ff', '#a855f7', '#ec4899']
const colorCurso = (index: number) => COLORES_CURSO[index % COLORES_CURSO.length]
const GAUGE = { cx: 110, cy: 118, radio: 56, grosor: 10, hueco: 6 }

export default function NotasPage() {
  const { user } = useAuth()
  const { asignaturas, asignaturasMap, notas, cargando } = useData()
  const [seleccionada, setSeleccionada] = useState<string | null>(null)
  const [notaModal, setNotaModal] = useState<{ open: boolean; nota: Nota | null }>({ open: false, nota: null })

  const notasDe = (id: string) => notas.filter((n) => n.asignatura_id === id)
  const evaluadas = asignaturas
    .map((asignatura) => ({ asignatura, notas: notasDe(asignatura.id) }))
    .filter((item) => item.notas.length)
    .map((item) => ({ ...item, final: calcularNotaFinal(item.notas) }))
  const mediaGlobal = evaluadas.length ? evaluadas.reduce((acc, item) => acc + item.final, 0) / evaluadas.length : null

  const porCurso = asignaturas.reduce((acc, asignatura) => {
    const key = asignatura.curso ?? 0
    ;(acc[key] ||= []).push(asignatura)
    return acc
  }, {} as Record<number, Asignatura[]>)
  const cursos = Object.keys(porCurso).map(Number).sort((a, b) => (a || 99) - (b || 99))

  // Arcoíris: un arco por curso (mínimo 1º a 4º), igual que el gráfico original.
  const cursosArcoiris = Array.from({ length: Math.max(4, ...cursos) }, (_, i) => i + 1)

  const resumenCurso = (curso: number) => {
    const items = evaluadas.filter((item) => (item.asignatura.curso ?? 0) === curso)
    return {
      total: porCurso[curso]?.length ?? 0,
      evaluadas: items.length,
      media: items.length ? items.reduce((acc, item) => acc + item.final, 0) / items.length : null,
    }
  }

  const asignatura = seleccionada ? asignaturasMap.get(seleccionada) : undefined
  const notasSeleccionada = seleccionada ? notasDe(seleccionada) : []
  const pesoSeleccionada = pesoEvaluado(notasSeleccionada)

  const eliminarNota = async (nota: Nota) => {
    if (!(await confirmar({ title: '¿Eliminar nota?', text: `${nota.tipo}: ${nota.nota}` }))) return
    try {
      await deleteDoc(doc(db, 'notas_academicas', nota.id))
      toast.success('Nota eliminada')
    } catch (err) {
      notifyError(err, 'No se pudo eliminar la nota')
    }
  }

  return (
    <AppShell title="Notas" subtitle={evaluadas.length ? `${evaluadas.length} de ${asignaturas.length} asignaturas evaluadas` : 'Calificaciones y medias'}>
      {cargando ? (
        <Skeleton />
      ) : !asignaturas.length ? (
        <EmptyState icon={faChartColumn} title="Sin asignaturas" text="Crea tus asignaturas para empezar a registrar notas." />
      ) : (
        <div className="stack">
          <section className="card grades-hero">
            <div className="grades-hero__main">
              <div className="grade-gauge">
                <svg viewBox="0 0 220 128" role="img" aria-label="Progreso de evaluación por curso">
                  {cursosArcoiris.map((curso, i) => {
                    const { total, evaluadas: conNota } = resumenCurso(curso)
                    const progreso = total ? conNota / total : 0
                    // El 1º curso es el arco exterior, como en la versión original.
                    const r = GAUGE.radio + (cursosArcoiris.length - 1 - i) * (GAUGE.grosor + GAUGE.hueco)
                    const mitad = Math.PI * r
                    const props = {
                      cx: GAUGE.cx,
                      cy: GAUGE.cy,
                      r,
                      fill: 'none',
                      strokeWidth: GAUGE.grosor,
                      transform: `rotate(180 ${GAUGE.cx} ${GAUGE.cy})`,
                    }
                    return (
                      <g key={curso}>
                        <circle {...props} className="grade-gauge__track" strokeDasharray={`${mitad} ${2 * mitad}`} />
                        {progreso > 0 && (
                          <circle {...props} stroke={colorCurso(i)} strokeLinecap="round" strokeDasharray={`${mitad * progreso} ${2 * mitad}`} />
                        )}
                      </g>
                    )
                  })}
                </svg>
                <strong className={mediaGlobal !== null ? gradeTone(mediaGlobal) : undefined}>
                  {mediaGlobal !== null ? formatNota(mediaGlobal) : '—'}
                </strong>
              </div>
              <small className="muted">{evaluadas.length ? 'Media global de todas las asignaturas' : 'Toca una asignatura para añadir su primera nota'}</small>
            </div>
            <ul className="course-bars">
              {cursosArcoiris.map((curso) => {
                const r = resumenCurso(curso)
                return (
                  <li key={curso}>
                    <span><i className="dot" style={{ background: colorCurso(cursosArcoiris.indexOf(curso)) }} /> {curso}º</span>
                    <span className="bar"><i style={{ width: `${r.media !== null ? r.media * 10 : 0}%` }} className={r.media !== null ? gradeTone(r.media) : ''} /></span>
                    <b>{r.media !== null ? formatNota(r.media) : '—'}</b>
                    <small className="muted">{r.evaluadas}/{r.total}</small>
                  </li>
                )
              })}
            </ul>
          </section>

          {cursos.map((curso) => (
            <section key={curso} className="card">
              <div className="card__head">
                <h2>{curso ? `${curso}º curso` : 'Sin curso'}</h2>
                <span className="muted">{resumenCurso(curso).evaluadas}/{porCurso[curso].length} evaluadas</span>
              </div>
              <ul className="grade-list">
                {porCurso[curso].map((a) => {
                  const lista = notasDe(a.id)
                  const final = lista.length ? calcularNotaFinal(lista) : null
                  const peso = pesoEvaluado(lista)
                  const media = mediaEvaluada(lista)
                  return (
                    <li key={a.id}>
                      <button type="button" className="grade-row" style={{ '--item': asignaturasMap.get(a.id)?.color } as React.CSSProperties} onClick={() => setSeleccionada(a.id)}>
                        <i className="dot" />
                        <span className="grade-row__body">
                          <strong>{a.nombre}</strong>
                          <span className="progress" aria-label={`${peso}% evaluado`}><i style={{ width: `${Math.min(100, peso)}%` }} /></span>
                          <small className="muted">
                            {lista.length
                              ? `${peso}% evaluado${peso > 0 && peso < 100 ? ` · media ${formatNota(media)}` : ''}`
                              : 'Sin notas'}
                          </small>
                        </span>
                        <span className={`grade ${final !== null ? gradeTone(media) : 'grade--empty'}`}>{final !== null ? formatNota(final) : '—'}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <Modal
        open={!!asignatura && !notaModal.open}
        onClose={() => setSeleccionada(null)}
        title={asignatura?.nombre ?? ''}
        subtitle={
          pesoSeleccionada > 100
            ? `${pesoSeleccionada}% evaluado · los pesos superan el 100%`
            : pesoSeleccionada > 0 && pesoSeleccionada < 100
              ? `${pesoSeleccionada}% evaluado · media sobre lo evaluado ${formatNota(mediaEvaluada(notasSeleccionada))}`
              : `${pesoSeleccionada}% evaluado`
        }
        accent={asignatura?.color}
        footer={
          <button type="button" className="btn btn--primary btn--block" onClick={() => setNotaModal({ open: true, nota: null })}>
            <FontAwesomeIcon icon={faPlus} /> Añadir nota
          </button>
        }
      >
        <div className="grade-detail">
          <span className={`grade grade--xl ${notasSeleccionada.length ? gradeTone(mediaEvaluada(notasSeleccionada)) : 'grade--empty'}`}>
            {notasSeleccionada.length ? formatNota(calcularNotaFinal(notasSeleccionada)) : '—'}
          </span>
          <span className="progress progress--lg"><i style={{ width: `${Math.min(100, pesoSeleccionada)}%` }} /></span>
        </div>
        {notasSeleccionada.length ? (
          <ul className="note-list">
            {notasSeleccionada.map((nota) => (
              <li key={nota.id}>
                <span className="note-list__body">
                  <strong>{nota.tipo}</strong>
                  <small className="muted">Peso {nota.peso}% · aporta {formatNota((Number(nota.nota) || 0) * (Number(nota.peso) || 0) / 100)}</small>
                </span>
                <b className={gradeTone(Number(nota.nota))}>{nota.nota}</b>
                <button type="button" className="icon-btn icon-btn--sm" onClick={() => setNotaModal({ open: true, nota })} aria-label={`Editar ${nota.tipo}`}>
                  <FontAwesomeIcon icon={faPen} />
                </button>
                <button type="button" className="icon-btn icon-btn--sm icon-btn--danger" onClick={() => eliminarNota(nota)} aria-label={`Eliminar ${nota.tipo}`}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted pad">Aún no hay notas en esta asignatura.</p>
        )}
      </Modal>

      {user && seleccionada && (
        <ModalNota
          open={notaModal.open}
          nota={notaModal.nota}
          asignaturaId={seleccionada}
          asignaturaNombre={asignatura?.nombre}
          pesoRestante={100 - pesoSeleccionada}
          userId={user.uid}
          onClose={() => setNotaModal((s) => ({ ...s, open: false }))}
        />
      )}
    </AppShell>
  )
}
