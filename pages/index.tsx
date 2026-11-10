import { useEffect } from 'react'
import toast from 'react-hot-toast'
import Dashboard from '@/components/Dashboard'
import { LOGOUT_FLAG, useAuth } from '@/lib/auth'
import Landing from '@/components/Landing'

export default function InicioPage() {
  const { user } = useAuth()

  useEffect(() => {
    try {
      if (localStorage.getItem(LOGOUT_FLAG) === 'true') {
        localStorage.removeItem(LOGOUT_FLAG)
        toast.success('Hasta luego 👋')
      }
    } catch {}
  }, [])

  if (user) return <Dashboard />

  return <Landing />
}
