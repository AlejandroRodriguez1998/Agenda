import Link from 'next/link'
import { useRouter } from 'next/router'
import type { ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBook,
  faCalendarDays,
  faChartColumn,
  faGraduationCap,
  faHome,
  faMagnifyingGlass,
  faMoon,
  faPlus,
  faSun,
  faTasks,
} from '@fortawesome/free-solid-svg-icons'
import ModalUsuario from './ModalUsuario'
import { useEffect, useState } from 'react'
import { getStoredTheme, setStoredTheme, type Theme } from '@/lib/theme'

type AppShellProps = {
  title: string
  eyebrow?: string
  children: ReactNode
  showAdd?: boolean
  onAddClick?: () => void
}

const navItems = [
  { href: '/', label: 'Inicio', icon: faHome },
  { href: '/horarios', label: 'Horario', icon: faCalendarDays },
  { href: '/asignaturas', label: 'Asignaturas', icon: faBook },
  { href: '/tareas', label: 'Tareas', icon: faTasks },
  { href: '/notas', label: 'Notas', icon: faChartColumn },
]

export default function AppShell({
  title,
  eyebrow = 'Agenda Académica',
  children,
  showAdd = true,
  onAddClick,
}: AppShellProps) {
  const router = useRouter()
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    setTheme(getStoredTheme())
  }, [])

  const cambiarTema = (nextTheme: Theme) => {
    setTheme(nextTheme)
    setStoredTheme(nextTheme)
  }

  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar">
        <Link href="/" className="academic-brand">
          <span><FontAwesomeIcon icon={faGraduationCap} /></span>
          <b>Agenda</b>
        </Link>

        <nav className="academic-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`academic-nav__item ${router.pathname === item.href ? 'is-active' : ''}`}
            >
              <FontAwesomeIcon icon={item.icon} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="academic-settings">
          <ModalUsuario />
          <span>Ajustes</span>
        </div>
      </aside>

      <div className="app-shell__body">
        <header className="app-shell__header">
          <div>
            <span>{eyebrow}</span>
            <h1>{title}</h1>
          </div>
          <label className="app-shell__search">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
            <input placeholder="Buscar..." />
          </label>
          <div className="app-shell__actions">
            <div className="theme-toggle" aria-label="Selector de tema">
              <button className={theme === 'light' ? 'is-active' : ''} onClick={() => cambiarTema('light')} aria-label="Tema claro">
                <FontAwesomeIcon icon={faSun} />
              </button>
              <button className={theme === 'dark' ? 'is-active' : ''} onClick={() => cambiarTema('dark')} aria-label="Tema oscuro">
                <FontAwesomeIcon icon={faMoon} />
              </button>
            </div>
            <ModalUsuario />
            {showAdd && (
              <button onClick={onAddClick} aria-label="Añadir">
                <FontAwesomeIcon icon={faPlus} />
              </button>
            )}
          </div>
        </header>

        {children}
      </div>
    </div>
  )
}
