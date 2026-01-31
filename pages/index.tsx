import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { auth } from '@/lib/firebaseClient'
import TopNav from '@/components/TopNav'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Head from 'next/head'
import CalendarioUsuario from '@/components/CalendarioUsuario'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import styles from '@/styles/Inicio.module.css'

export default function InicioPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (localStorage.getItem('showLogoutToast') === 'true') {
      localStorage.removeItem('showLogoutToast')
      toast.success('Hasta luego 👋', {
        style: { background: '#1a1a1a', color: '#fff' }
      })
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser ?? null)
      setCargando(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <>
      <Head>
        <title>Agenda Escolar</title>
      </Head>

      {cargando ? (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : user ? (
        <>
          <TopNav
            title="🏠 Inicio"
            customRightIcon="logout"
            onRightClick={async () => {
              await signOut(auth)
              localStorage.setItem('showLogoutToast', 'true')
              router.push('/').then(() => router.reload())
            }}
          />
          <CalendarioUsuario userId={user.uid} />
        </>
      ) : (
        <div className={styles.landing}>
          <div className={styles.hero}>
            <div className={styles.heroContent}>
              <span className={styles.badge}>Agenda escolar inteligente</span>
              <h1 className={styles.title}>Organiza tu semana en minutos</h1>
              <p className={styles.subtitle}>
                Planifica tareas, horarios, eventos y notas desde un solo lugar. Todo lo
                que necesitas para llevar el control de tu vida academica.
              </p>
              <div className={styles.ctaRow}>
                <Link href="/login" className="btn btn-light btn-lg px-4">Iniciar sesión</Link>
                <span className={styles.ctaHint}>Sin anuncios • Gratis</span>
              </div>
              <div className={styles.stats}>
                <div>
                  <div className={styles.statValue}>4</div>
                  <div className={styles.statLabel}>vistas clave</div>
                </div>
                <div>
                  <div className={styles.statValue}>100%</div>
                  <div className={styles.statLabel}>en la nube</div>
                </div>
                <div>
                  <div className={styles.statValue}>1</div>
                  <div className={styles.statLabel}>panel unificado</div>
                </div>
              </div>
            </div>
            <div className={styles.heroCard}>
              <div className={styles.heroCardHeader}>
                <span>Hoy</span>
                <span className={styles.heroChip}>En curso</span>
              </div>
              <div className={styles.heroCardBody}>
                <div className={styles.heroRow}>
                  <div className={styles.heroDot}></div>
                  <div>
                    <div className={styles.heroRowTitle}>Matematicas</div>
                    <div className={styles.heroRowMeta}>08:30 · Clase teorica</div>
                  </div>
                </div>
                <div className={styles.heroRow}>
                  <div className={`${styles.heroDot} ${styles.heroDotAlt}`}></div>
                  <div>
                    <div className={styles.heroRowTitle}>Tarea de historia</div>
                    <div className={styles.heroRowMeta}>Entrega mañana</div>
                  </div>
                </div>
                <div className={styles.heroChecklist}>
                  <div>✅ Repasar examen</div>
                  <div>✅ Subir apuntes</div>
                  <div>⬜ Preparar laboratorio</div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <h4>📝 Gestiona tus tareas</h4>
              <p>Añade, marca como completadas y organiza tus tareas por asignatura.</p>
            </div>
            <div className={styles.featureCard}>
              <h4>📚 Organiza tus asignaturas</h4>
              <p>Crea asignaturas y asigna colores para identificarlas rapidamente.</p>
            </div>
            <div className={styles.featureCard}>
              <h4>📊 Controla tus notas</h4>
              <p>Introduce calificaciones, pesos y visualiza tu media global.</p>
            </div>
            <div className={styles.featureCard}>
              <h4>🗓️ Agenda visual</h4>
              <p>Eventos, clases y tareas en un calendario claro y rapido.</p>
            </div>
          </div>

          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>01</div>
              <div>
                <h5>Inicia sesion</h5>
                <p>Accede a tu cuenta y sincroniza todo en la nube.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>02</div>
              <div>
                <h5>Configura tus asignaturas</h5>
                <p>Colores, cursos y horarios personalizados al instante.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>03</div>
              <div>
                <h5>Planifica tu semana</h5>
                <p>Añade tareas, eventos y notas desde cualquier dispositivo.</p>
              </div>
            </div>
          </div>

          <div className={styles.finalCta}>
            <div>
              <h3>Todo tu ritmo academico en un mismo lugar</h3>
              <p>Empieza ahora y manten el control sin esfuerzo.</p>
            </div>
            <Link href="/login" className="btn btn-outline-light btn-lg px-4">Entrar</Link>
          </div>
        </div>
      )}
    </>
  )
}
