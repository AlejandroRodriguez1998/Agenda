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

  const navStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: '8px',
    paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 3px)',
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    borderTop: '1px solid #333',
    zIndex: 1000,
  }

  const linkStyle: React.CSSProperties = {
    textDecoration: 'none',
    color: '#aaa',
    fontSize: '0.8rem',
  }

  const activeStyle: React.CSSProperties = {
    color: '#0d6efd', // azul Bootstrap
  }

  return (
    <nav
      className="navbar d-flex justify-content-around"
      style={navStyle}
    >
      <Link href="/" style={router.pathname === '/' ? { ...linkStyle, ...activeStyle } : linkStyle}>
        <div className="text-center">
          <FontAwesomeIcon icon={faHome} size="lg" />
          <div>Inicio</div>
        </div>
      </Link>

      <Link href="/horarios" style={router.pathname === '/horarios' ? { ...linkStyle, ...activeStyle } : linkStyle}>
        <div className="text-center">
          <FontAwesomeIcon icon={faClock} size="lg" />
          <div>Horarios</div>
        </div> 
      </Link>

      <Link href="/tareas" style={router.pathname === '/tareas' ? { ...linkStyle, ...activeStyle } : linkStyle}>
        <div className="text-center">
          <FontAwesomeIcon icon={faTasks} size="lg" />
          <div>Tareas</div>
        </div>
      </Link>

      <Link href="/notas" style={router.pathname === '/notas' ? { ...linkStyle, ...activeStyle } : linkStyle}>
        <div className="text-center">
          <FontAwesomeIcon icon={faChartColumn} size="lg" />
          <div>Notas</div>
        </div>
      </Link>

      <Link href="/asignaturas" style={router.pathname === '/asignaturas' ? { ...linkStyle, ...activeStyle } : linkStyle}>
        <div className="text-center">
          <FontAwesomeIcon icon={faBook} size="lg" />
          <div>Asignaturas</div>
        </div>
      </Link>
    </nav>
  )
}
