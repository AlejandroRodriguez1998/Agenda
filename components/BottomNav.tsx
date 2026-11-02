import Link from 'next/link'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBook, faCalendarDays, faChartColumn, faHouse, faListCheck } from '@fortawesome/free-solid-svg-icons'

export const NAV_ITEMS = [
  { href: '/', label: 'Inicio', icon: faHouse },
  { href: '/horarios', label: 'Horario', icon: faCalendarDays },
  { href: '/tareas', label: 'Tareas', icon: faListCheck },
  { href: '/notas', label: 'Notas', icon: faChartColumn },
  { href: '/asignaturas', label: 'Asignaturas', icon: faBook },
]

export default function BottomNav({ pendientes }: { pendientes: number }) {
  const router = useRouter()

  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {NAV_ITEMS.map((item) => {
        const active = router.pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`bottom-nav__item ${active ? 'is-active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <span className="bottom-nav__icon">
              <FontAwesomeIcon icon={item.icon} />
              {item.href === '/tareas' && pendientes > 0 && <i className="badge-dot">{pendientes > 9 ? '9+' : pendientes}</i>}
            </span>
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
