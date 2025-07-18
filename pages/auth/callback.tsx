import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Callback() {
  const router = useRouter()

  useEffect(() => {
    const verifyEmail = async () => {
      const { query } = router
      const token = query.token as string
      const email = query.email as string
      const type = query.type as string

      if (type === 'signup' && token && email) {
        const { error } = await supabase.auth.verifyOtp({
          email,
          token,
          type: 'signup'
        })

        if (error) {
          console.error('❌ Error verificando el correo:', error.message)
          return
        }

        console.log('✅ Cuenta verificada correctamente')
        router.replace('/')
      }
    }

    if (router.isReady) {
      verifyEmail()
    }
  }, [router])

  return <p className="p-4">Verificando cuenta...</p>
}
