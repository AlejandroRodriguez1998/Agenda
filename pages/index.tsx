import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import TopNav from '@/components/TopNav'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Head from 'next/head'
import CalendarioUsuario from '@/components/CalendarioUsuario'

type Evento = {
  id: string
  title: string
  start: string
  color: string
}

export default function InicioPage() {
  const router = useRouter()
  const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(null)

  useEffect(() => {
    if (localStorage.getItem('showLogoutToast') === 'true') {
      localStorage.removeItem('showLogoutToast')
      toast.success('Hasta luego 👋', {
        style: { background: '#1a1a1a', color: '#fff' }
      })
    }

    const obtenerUsuario = async () => {
      const { data } = await supabase.auth.getSession()
      const user = data.session?.user
      setUser(user ?? null)
    }

    obtenerUsuario()
  }, [])

  return (
    <>
      <Head>
        <title>Agenda Escolar</title>
      </Head>

      {user && <TopNav title="🏠 Inicio" customRightIcon="logout" onRightClick={async () => {
        await supabase.auth.signOut()
        localStorage.setItem('showLogoutToast', 'true')
        router.push('/').then(() => router.reload())
      }} />}

      {user ? (
        <CalendarioUsuario userId={user.id} />
      ) : (
        <div style={{ minHeight: '100vh', color: 'white' }}>
          {/* HERO */}
          <div className="container pb-5 d-flex flex-column justify-content-center align-items-center text-center">
            <h1 className="display-4 mb-3">👋 Bienvenido a tu Agenda Escolar</h1>
            <p className="lead mb-4">
              Organiza fácilmente tus tareas, exámenes y asignaturas desde un solo lugar.
            </p>
            <div className="d-flex gap-3 flex-wrap justify-content-center mb-5">
              <Link href="/login" className="btn btn-light btn-lg px-4">Iniciar sesión</Link>
            </div>
          </div>

          {/* FUNCIONALIDADES */}
          <div className="container pb-5">
            <div className="row g-4">
              <div className="col-md-4">
                <div className="bg-dark text-white rounded p-4 h-100 shadow">

                  <h4>📝 Gestiona tus tareas</h4>
                  <p className="mt-2">Añade, marca como completadas y organiza tus tareas por asignatura.</p>

                </div>
              </div>
              <div className="col-md-4">
                <div className="bg-dark text-white rounded p-4 h-100 shadow">

                  <h4>📚 Organiza tus asignaturas</h4>
                  <p className="mt-2">Crea asignaturas y asigna colores para identificarlas rápidamente.</p>

                </div>
              </div>
              <div className="col-md-4">
                <div className="bg-dark text-white rounded p-4 h-100 shadow">

                  <h4>📊 Calcula tus notas</h4>
                  <p className="mt-2">Introduce tus calificaciones, pesos y visualiza tu media global.</p>

                </div>
              </div>
            </div>
          </div>

          {/* CIERRE */}
          <div className="text-center pb-5">
            <p className="text-white-50 fst-italic">✨ Empieza ahora a tener tu vida académica bajo control. ¡Tu yo del futuro te lo agradecerá!</p>
          </div>
        </div>
      )}
    </>
  )
}
