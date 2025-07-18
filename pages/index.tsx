import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

import Link from 'next/link'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user ?? null)
      setLoading(false)
    }

    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="d-flex vh-100 justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-5">
      {user ? (
        <div className="text-center">
          <h1 className="mb-4">📚 Bienvenido a tu Agenda Escolar</h1>
          <p className="lead">Has iniciado sesión como:</p>
          <p className="fw-bold">{user.email}</p>
          <Link href="/logout" className="btn btn-outline-danger mt-3">
            Cerrar sesión
          </Link>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="mb-4">👋 Bienvenido a la Agenda Escolar</h1>
          <p className="lead">Inicia sesión para ver tus horarios, tareas y notas</p>
          <Link href="/login" className="btn btn-primary mt-3">
            Iniciar sesión
          </Link>
        </div>
      )}
    </div>
  )
}

