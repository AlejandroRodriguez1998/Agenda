import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import TopNav from '@/components/TopNav'
import Swal from 'sweetalert2'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function InicioPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    if (localStorage.getItem('showLogoutToast') === 'true') {
      localStorage.removeItem('showLogoutToast')
      toast.success('Hasta luego 👋', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
        },
      })
    }

    const obtenerUsuario = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user ?? null)
    }
    obtenerUsuario()
  }, [])

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    
    localStorage.setItem('showLogoutToast', 'true')
    router.push('/').then(() => router.reload())
  }

  return (
    <>
      {user && (
        <TopNav
          title="🏠 Inicio"
          customRightIcon="logout"
          onRightClick={cerrarSesion}
        />
      )}

      <div className="container mt-4">
        {user ? (
          <div className="text-white">
            <h2>Bienvenido a tu agenda escolar 🎓</h2>
            <p className="mt-3">
              Selecciona una sección en la barra inferior para comenzar.
            </p>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="mb-4">👋 Bienvenido a la Agenda Escolar</h1>
            <p className="lead">
              Inicia sesión para ver tus horarios, tareas y notas
            </p>
            <Link href="/login" className="btn btn-primary mt-3">
              Iniciar sesión
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
