import Head from 'next/head'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faBolt,
  faCalendarDays,
  faChartColumn,
  faCheck,
  faClock,
  faGraduationCap,
  faHouse,
  faListCheck,
  faBook,
  faMobileScreen,
  faMoon,
  faWifi,
} from '@fortawesome/free-solid-svg-icons'
import { addDays, capitalize, formatDate, startOfWeek, toDateKey } from '@/lib/dates'
import styles from '@/styles/Landing.module.css'

const FUNCIONES = [
  { icon: faCalendarDays, color: '#6c63ff', title: 'Calendario completo', text: 'Vista de semana, día y mes con tus clases, entregas y eventos juntos.' },
  { icon: faClock, color: '#06b6d4', title: 'Horario semanal', text: 'Añade cada clase una vez y aparece sola todas las semanas.' },
  { icon: faListCheck, color: '#f43f5e', title: 'Tareas y entregas', text: 'Atrasadas, para hoy y para esta semana. Nada se te escapa.' },
  { icon: faChartColumn, color: '#10b981', title: 'Notas y medias', text: 'Pesos por evaluación y medias por asignatura y curso al momento.' },
  { icon: faWifi, color: '#f59e0b', title: 'Funciona sin conexión', text: 'Tus datos se guardan en el móvil y se sincronizan al volver.' },
  { icon: faMoon, color: '#a855f7', title: 'Claro u oscuro', text: 'Elige el tema que prefieras para estudiar de día o de noche.' },
]

const PASOS = [
  { title: 'Crea tus asignaturas', text: 'Con su color y su curso. Son la base de todo lo demás.' },
  { title: 'Monta tu horario', text: 'Marca los días y la hora de cada clase en un momento.' },
  { title: 'Apunta tareas y notas', text: 'La app calcula tus medias y te avisa de lo urgente.' },
]

/** Maqueta del panel de la app, hecha con HTML para que siempre esté al día. */
function PhoneMockup() {
  // Fecha fija de ejemplo: la landing se pre-renderiza y usar "hoy" desajustaría la hidratación.
  const hoy = new Date(2026, 9, 14)
  const semana = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(hoy), i))
  const agenda = [
    { hora: '09:00', title: 'Sistemas Distribuidos', sub: 'Teórica', color: '#6c63ff' },
    { hora: 'Entrega', title: 'Práctica 2: sockets', sub: 'Redes', color: '#f43f5e' },
    { hora: '11:30', title: 'Bases de Datos', sub: 'Laboratorio', color: '#10b981' },
    { hora: '16:00', title: 'Inteligencia Artificial', sub: 'Teórica', color: '#f59e0b' },
  ]

  return (
    <div className={styles.phone} aria-hidden="true">
      <div className={styles.phoneNotch} />
      <div className={styles.phoneScreen}>
        <span className={styles.mockEyebrow}>{capitalize(formatDate(hoy, { weekday: 'long', day: 'numeric', month: 'long' }))}</span>
        <strong className={styles.mockTitle}>Buenas tardes, Lucía</strong>

        <div className={styles.mockStats}>
          <span><b>4</b>clases hoy</span>
          <span><b>3</b>entregas</span>
          <span><b>7,8</b>media</span>
        </div>

        <div className={styles.mockWeek}>
          {semana.map((dia) => (
            <span key={toDateKey(dia)} className={toDateKey(dia) === toDateKey(hoy) ? styles.mockToday : undefined}>
              <small>{formatDate(dia, { weekday: 'narrow' })}</small>
              <b>{dia.getDate()}</b>
            </span>
          ))}
        </div>

        <div className={styles.mockAgenda}>
          {agenda.map((item) => (
            <span key={item.title} style={{ '--c': item.color } as React.CSSProperties}>
              <small>{item.hora}</small>
              <b>{item.title}<em>{item.sub}</em></b>
            </span>
          ))}
        </div>

        <div className={styles.mockNav}>
          {[faHouse, faCalendarDays, faListCheck, faChartColumn, faBook].map((icon, i) => (
            <span key={i} className={i === 0 ? styles.mockNavActive : undefined}><FontAwesomeIcon icon={icon} /></span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Landing() {
  return (
    <>
      <Head>
        <title>Agenda Académica · Tu curso, en orden</title>
      </Head>

      <div className={styles.page}>
        <section className={styles.hero}>
          <span className={`${styles.blob} ${styles.blob1}`} aria-hidden="true" />
          <span className={`${styles.blob} ${styles.blob2}`} aria-hidden="true" />
          <span className={`${styles.blob} ${styles.blob3}`} aria-hidden="true" />

          <header className={styles.nav}>
            <Link href="/" className={styles.brand}>
              <span className={styles.brandMark}><FontAwesomeIcon icon={faGraduationCap} /></span>
              Agenda
            </Link>
            <nav className={styles.navActions}>
              <Link href="/login" className={styles.navLink}>Entrar</Link>
              <Link href="/login?modo=registro" className={styles.navCta}>Crear cuenta</Link>
            </nav>
          </header>

          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <span className={styles.pill}><FontAwesomeIcon icon={faBolt} /> Gratis · Instalable en el móvil</span>
              <h1>
                Tu vida académica,
                <span> en un solo sitio.</span>
              </h1>
              <p>
                Horario, tareas, entregas y notas organizados en una app rápida y bonita,
                pensada para el móvil y que funciona incluso sin conexión.
              </p>
              <div className={styles.ctaRow}>
                <Link href="/login?modo=registro" className={styles.ctaPrimary}>
                  Empezar gratis <FontAwesomeIcon icon={faArrowRight} />
                </Link>
                <Link href="/login" className={styles.ctaGhost}>Ya tengo cuenta</Link>
              </div>
              <ul className={styles.trust}>
                <li><FontAwesomeIcon icon={faCheck} /> Sin anuncios</li>
                <li><FontAwesomeIcon icon={faCheck} /> Datos en tiempo real</li>
                <li><FontAwesomeIcon icon={faCheck} /> Claro y oscuro</li>
              </ul>
            </div>

            <div className={styles.heroVisual}>
              <PhoneMockup />

              <div className={`${styles.floatCard} ${styles.floatTask}`} aria-hidden="true">
                <span className={styles.floatCheck}><FontAwesomeIcon icon={faCheck} /></span>
                <span><b>¡Tarea completada!</b><small>Práctica 2 · Redes</small></span>
              </div>

              <div className={`${styles.floatCard} ${styles.floatGrade}`} aria-hidden="true">
                <svg viewBox="0 0 60 34">
                  {['#ff4d4f', '#fadb14', '#52c41a', '#1677ff'].map((color, i) => {
                    const r = 28 - i * 6
                    return <path key={color} d={`M ${30 - r} 32 A ${r} ${r} 0 0 1 ${30 + r} 32`} stroke={color} />
                  })}
                </svg>
                <span><b>7,82</b><small>Media global</small></span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow}>Todo lo que necesitas</span>
            <h2>Menos apps, más tiempo para estudiar</h2>
          </div>
          <div className={styles.features}>
            {FUNCIONES.map((f) => (
              <article key={f.title} className={styles.feature} style={{ '--c': f.color } as React.CSSProperties}>
                <span className={styles.featureIcon}><FontAwesomeIcon icon={f.icon} /></span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow}>En tres pasos</span>
            <h2>Listo en cinco minutos</h2>
          </div>
          <ol className={styles.steps}>
            {PASOS.map((paso, i) => (
              <li key={paso.title}>
                <span className={styles.stepNumber}>{i + 1}</span>
                <div>
                  <h3>{paso.title}</h3>
                  <p>{paso.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.section}>
          <div className={styles.finalCta}>
            <span className={`${styles.blob} ${styles.blob2}`} aria-hidden="true" />
            <FontAwesomeIcon icon={faMobileScreen} className={styles.finalIcon} />
            <h2>Llévala siempre contigo</h2>
            <p>Crea tu cuenta y añádela a la pantalla de inicio para usarla como una app más.</p>
            <Link href="/login?modo=registro" className={styles.ctaPrimary}>
              Crear mi cuenta <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
        </section>

        <footer className={styles.footer}>
          <span className={styles.brand}>
            <span className={styles.brandMark}><FontAwesomeIcon icon={faGraduationCap} /></span>
            Agenda
          </span>
          <small>© {new Date().getFullYear()} Agenda Académica · Hecho por Alejandro Paniagua</small>
        </footer>
      </div>
    </>
  )
}
