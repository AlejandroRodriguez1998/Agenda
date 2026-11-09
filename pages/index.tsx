import { useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Dashboard from '@/components/Dashboard'
import { LOGOUT_FLAG, useAuth } from '@/lib/auth'
import { formatDate } from '@/lib/dates'
import styles from '@/styles/Inicio.module.css'

export default function InicioPage() {
  const { user } = useAuth()

  useEffect(() => {
    try {
      if (localStorage.getItem(LOGOUT_FLAG) === 'true') {
        localStorage.removeItem(LOGOUT_FLAG)
        toast.success('Hasta luego 👋')
      }
    } catch {}
  }, [])

  if (user) return <Dashboard />

  return (
    <>
      <Head>
        <title>Agenda Académica</title>
      </Head>

      <div className={styles.landing}>
        <header className={styles.publicNav}>
          <div className={styles.brandMark}>A</div>
          <span>Agenda Académica</span>
          <Link href="/login">Entrar</Link>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.badge}>Dashboard universitario</span>
            <h1 className={styles.title}>Agenda Académica</h1>
            <p className={styles.subtitle}>
              Un panel claro para organizar horarios, tareas, entregas y notas sin perderte
              entre pantallas repetidas.
            </p>
            <div className={styles.ctaRow}>
              <Link href="/login" className={styles.primaryCta}>Empezar ahora</Link>
              <span className={styles.ctaHint}>Gratis para uso personal</span>
            </div>
          </div>

          <div className={styles.productPreview} aria-label="Vista previa del dashboard">
            <div className={styles.previewHeader}>
              <div>
                <span>Hoy</span>
                <strong>{formatDate(new Date(), { day: 'numeric', month: 'long' })}</strong>
              </div>
              <b>Semana</b>
            </div>
            <div className={styles.previewSchedule}>
              <div className={styles.previewEvent}>
                <span>09:00</span>
                <div>
                  <strong>Sistemas Distribuidos</strong>
                  <p>Aula 1.2</p>
                </div>
              </div>
              <div className={styles.previewEvent}>
                <span>12:00</span>
                <div>
                  <strong>Práctica de Redes</strong>
                  <p>Entrega pendiente</p>
                </div>
              </div>
            </div>
            <div className={styles.previewStats}>
              <div>
                <span>4</span>
                <p>Tareas abiertas</p>
              </div>
              <div>
                <span>6.62</span>
                <p>Media global</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.featureBand} aria-label="Funciones principales">
          <div>
            <span>Calendario</span>
            <strong>Semana, día y mes</strong>
          </div>
          <div>
            <span>Tareas</span>
            <strong>Pendientes y entregas</strong>
          </div>
          <div>
            <span>Notas</span>
            <strong>Medias ponderadas</strong>
          </div>
        </section>

        <section className={styles.workflow} aria-label="Resumen de uso">
          <article className={styles.workflowCard}>
            <span className={styles.workflowLabel}>Organiza</span>
            <h2>Todo empieza en tu semana</h2>
            <p>
              Reúne clases recurrentes, tutorías, prácticas y entregas en un calendario que
              se puede revisar de un vistazo.
            </p>
          </article>
          <article className={styles.workflowCard}>
            <span className={styles.workflowLabel}>Prioriza</span>
            <h2>Las tareas no se pierden</h2>
            <p>
              Marca pendientes, separa lo urgente de lo hecho y conserva el contexto de cada
              asignatura sin abrir otra herramienta.
            </p>
          </article>
          <article className={styles.workflowCard}>
            <span className={styles.workflowLabel}>Mide</span>
            <h2>Notas claras por asignatura</h2>
            <p>
              Guarda calificaciones con peso, consulta medias y detecta rápido dónde conviene
              apretar un poco más.
            </p>
          </article>
        </section>
      </div>
    </>
  )
}
