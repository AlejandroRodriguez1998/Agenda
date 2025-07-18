import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/router'

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

  return (
    <nav
      className="navbar fixed-bottom navbar-light bg-light border-top shadow-sm d-flex justify-content-around"
       style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: '8px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
        backgroundColor: '#f8f9fa',
        zIndex: 1000,
      }}
    >
      <Link
        href="/"
        className={`btn btn-link ${router.pathname === '/' ? 'text-primary' : ''}`}
      >
        🏠
        <small className="d-block">Inicio</small>
      </Link>

      <Link
        href="/tareas"
        className={`btn btn-link ${router.pathname === '/tareas' ? 'text-primary' : ''}`}
      >
        📝
        <small className="d-block">Tareas</small>
      </Link>

      <Link
        href="/asignaturas"
        className={`btn btn-link ${router.pathname === '/asignaturas' ? 'text-primary' : ''}`}
      >
        📚
        <small className="d-block">Asignaturas</small>
      </Link>

      <Link
        href="/notas"
        className={`btn btn-link ${router.pathname === '/notas' ? 'text-primary' : ''}`}
      >
        📊
        <small className="d-block">Notas</small>
      </Link>
    </nav>
  )
}
