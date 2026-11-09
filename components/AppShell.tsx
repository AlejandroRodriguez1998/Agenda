import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, type ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBook,
  faGraduationCap,
  faMoon,
  faPlus,
  faSun,
} from '@fortawesome/free-solid-svg-icons'
import BottomNav, { NAV_ITEMS } from './BottomNav'
import ModalUsuario, { iniciales } from './ModalUsuario'
import { useAuth } from '@/lib/auth'
import { useData } from '@/lib/data'
import { useTheme } from '@/lib/theme'

type AppShellProps = {
  title: string
  subtitle?: string
  children: ReactNode
  onAdd?: () => void
  addLabel?: string
}

export default function AppShell({ title, subtitle, children, onAdd, addLabel = 'Añadir' }: AppShellProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { tareas, error } = useData()
  const { theme, setTheme } = useTheme()
  const [ajustesAbiertos, setAjustesAbiertos] = useState(false)

  const pendientes = tareas.filter((tarea) => !tarea.completada).length
  const avatar = iniciales(user?.displayName, user?.email)

  return (
    <div className="shell">
      <Head>
        <title>{`${title} · Agenda`}</title>
      </Head>

      <aside className="sidebar">
        <Link href="/" className="brand">
          <span className="brand__mark"><FontAwesomeIcon icon={faGraduationCap} /></span>
          <span>Agenda</span>
        </Link>

        <nav className="sidebar__nav" aria-label="Navegación principal">
          {NAV_ITEMS.map((item) => {
            const active = router.pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar__item ${active ? 'is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <FontAwesomeIcon icon={item.icon} fixedWidth />
                <span>{item.label}</span>
                {item.href === '/tareas' && pendientes > 0 && <i className="count">{pendientes}</i>}
              </Link>
            )
          })}
        </nav>

        <div className="sidebar__footer">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? 'Usar tema claro' : 'Usar tema oscuro'}
          >
            <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
          </button>
          <button type="button" className="sidebar__user" onClick={() => setAjustesAbiertos(true)}>
            <span className="avatar">{avatar}</span>
            <span className="sidebar__email">{user?.email}</span>
          </button>
        </div>
      </aside>

      <div className="shell__main">
        <header className="topbar">
          <div className="topbar__titles">
            {subtitle && <span className="eyebrow">{subtitle}</span>}
            <h1>{title}</h1>
          </div>
          <div className="topbar__actions">
            {onAdd && (
              <button type="button" className="btn btn--primary topbar__add" onClick={onAdd}>
                <FontAwesomeIcon icon={faPlus} /> {addLabel}
              </button>
            )}
            <button type="button" className="avatar avatar--btn topbar__avatar" onClick={() => setAjustesAbiertos(true)} aria-label="Ajustes de cuenta">
              {avatar}
            </button>
          </div>
        </header>

        <main className="page">
          {error && (
            <div className="banner banner--error" role="alert">
              <strong>No se pudieron cargar algunos datos.</strong> {error}
            </div>
          )}
          {children}
        </main>
      </div>

      {onAdd && (
        <button type="button" className="fab" onClick={onAdd} aria-label={addLabel}>
          <FontAwesomeIcon icon={faPlus} />
        </button>
      )}

      <BottomNav pendientes={pendientes} />
      <ModalUsuario open={ajustesAbiertos} onClose={() => setAjustesAbiertos(false)} />
    </div>
  )
}

export function EmptyState({ icon, title, text, action }: { icon: typeof faBook; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <span className="empty__icon"><FontAwesomeIcon icon={icon} /></span>
      <strong>{title}</strong>
      {text && <p>{text}</p>}
      {action}
    </div>
  )
}

export function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="skeleton-list" aria-busy="true" aria-label="Cargando">
      {Array.from({ length: rows }, (_, index) => <span key={index} className="skeleton" />)}
    </div>
  )
}
