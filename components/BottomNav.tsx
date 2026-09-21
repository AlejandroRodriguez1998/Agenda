import Link from 'next/link'
import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebaseClient'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBook, faChartColumn, faClock, faHome, faTasks } from '@fortawesome/free-solid-svg-icons'
import { onAuthStateChanged } from 'firebase/auth'

export default function BottomNav() {
  const [show, setShow] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setShow(!!auth.currentUser)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setShow(!!user)
    })

    return () => unsubscribe()
  }, [])

  if (!show) return null

  const items = [
    { href: '/', label: 'Inicio', icon: faHome },
    { href: '/horarios', label: 'Horario', icon: faClock },
    { href: '/asignaturas', label: 'Asignaturas', icon: faBook },
    { href: '/tareas', label: 'Tareas', icon: faTasks },
    { href: '/notas', label: 'Notas', icon: faChartColumn },
  ]

  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`bottom-nav__item ${router.pathname === item.href ? 'is-active' : ''}`}
        >
          <FontAwesomeIcon icon={item.icon} />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
