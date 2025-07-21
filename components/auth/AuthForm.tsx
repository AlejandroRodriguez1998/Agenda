import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import styles from './AuthForm.module.css'
import toast from 'react-hot-toast'
import  Head  from 'next/head'
import Swal from 'sweetalert2'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const action = isLogin
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/verificar` } })

    const { error } = await action

    if (error) {
      const traduccion = traducirError(error.message)
      toast.error(traduccion, {
        style: {
          background: '#1a1a1a',
          color: '#fff',
        },
      })
      return
    }

    if (isLogin) {
      toast.success('¡Bienvenido! 👋', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
        },
      })
      router.push('/')
    } else {
      await Swal.fire({
        icon: 'success',
        title: '¡Registro completado!',
        text: 'Hemos enviado un correo a tu dirección para que verifiques tu cuenta.',
        confirmButtonText: 'Entendido',
        background: '#1a1a1a',
        color: '#fff',
      })
    }
  }

  function traducirError(mensaje: string): string {
    const errores: Record<string, string> = {
      'Invalid login credentials': 'Credenciales incorrectas',
      'Email not confirmed': 'Debes confirmar tu correo antes de iniciar sesión',
      'User already registered': 'El usuario ya está registrado',
      'Invalid email or password': 'Correo o contraseña incorrectos',
      'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
      'User not found': 'Usuario no encontrado',
      'Email is invalid': 'El correo no es válido',
    }

    return errores[mensaje] || 'Error desconocido'
  }

  return (
    <><Head>
      <title>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</title>
    </Head>

    <div className={styles.wrapper}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.title}>
            {isLogin ? 'Bienvenido de nuevo,' : 'Bienvenido,'}
            <br />
            <span>{isLogin ? 'inicia sesión para continuar' : 'registrarse para continuar'}</span>
          </div>

          <input className={styles.input} type="email" name="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <input className={styles.input} type="password" name="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <button type="submit" className={styles['button-confirm']}>
            {isLogin ? 'Acceder' : 'Registrarse'} →
          </button>

          <p style={{ fontSize: '0.9rem', marginTop: '10px', color: 'black' }}>
            {isLogin ? '¿No tienes cuenta?' : '¿Tienes una cuenta?'}{' '}
            <button type="button" onClick={() => setIsLogin(!isLogin)} style={{color: 'blue',background: 'none',border: 'none',textDecoration: 'underline',cursor: 'pointer',fontWeight: 'bold',}}>
              {isLogin ? 'Registrarse' : 'Iniciar Sesión'}
            </button>
          </p>
        </form>
      </div></>
  )
}
