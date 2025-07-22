import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function BottomNav() {
  const [show, setShow] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const comprobarSesion = async () => {
      const { data } = await supabase.auth.getSession()
      setShow(!!data.session?.user)
    }

    comprobarSesion()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setShow(!!session?.user)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
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
          <FontAwesomeIcon icon="home" size="lg" />
          <div>Inicio</div>
        </div>
      </Link>

      <Link href="/tareas" style={router.pathname === '/tareas' ? { ...linkStyle, ...activeStyle } : linkStyle}>
        <div className="text-center">
          <FontAwesomeIcon icon="tasks" size="lg" />
          <div>Tareas</div>
        </div>
      </Link>

      <Link href="/notas" style={router.pathname === '/notas' ? { ...linkStyle, ...activeStyle } : linkStyle}>
        <div className="text-center">
          <FontAwesomeIcon icon="chart-column" size="lg" />
          <div>Notas</div>
        </div>
      </Link>

      <Link href="/asignaturas" style={router.pathname === '/asignaturas' ? { ...linkStyle, ...activeStyle } : linkStyle}>
        <div className="text-center">
          <FontAwesomeIcon icon="book" size="lg" />
          <div>Asignaturas</div>
        </div>
      </Link>
    </nav>
  )
}
