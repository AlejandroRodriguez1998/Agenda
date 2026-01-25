import { useState } from 'react'
import { useRouter } from 'next/router'
import { auth } from '@/lib/firebaseClient'
import styles from './AuthForm.module.css'
import toast from 'react-hot-toast'
import Head from 'next/head'
import Swal from 'sweetalert2'
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from 'firebase/auth'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password)
        toast.success('¡Bienvenido! 👋', {
          style: {
            background: '#1a1a1a',
            color: '#fff',
          },
        })
        router.push('/')
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        await sendEmailVerification(cred.user, {
          url: `${window.location.origin}/verificar`,
        })

        await Swal.fire({
          icon: 'success',
          title: '¡Registro completado!',
          text: 'Hemos enviado un correo a tu dirección para que verifiques tu cuenta.',
          confirmButtonText: 'Entendido',
          background: '#1a1a1a',
          color: '#fff',
        })
      }
    } catch (err) {
      const firebaseError = err as { code?: string; message?: string }
      const traduccion = traducirError(firebaseError.code || firebaseError.message || '')
      toast.error(traduccion, {
        style: {
          background: '#1a1a1a',
          color: '#fff',
        },
      })
      return
    }
  }

  function traducirError(mensaje: string): string {
    const errores: Record<string, string> = {
      'auth/invalid-credential': 'Credenciales incorrectas',
      'auth/wrong-password': 'Credenciales incorrectas',
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/email-already-in-use': 'El usuario ya está registrado',
      'auth/invalid-email': 'El correo no es válido',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/too-many-requests': 'Demasiados intentos. Inténtalo más tarde',
    }

    return errores[mensaje] || 'Error desconocido'
  }

  return (
    <>
      <Head>
        <title>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</title>
      </Head>

      <div className={styles.wrapper}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.title}>
            {isLogin ? 'Bienvenido de nuevo,' : 'Bienvenido,'}
            <br />
            <span>{isLogin ? 'inicia sesión para continuar' : 'registrarse para continuar'}</span>
          </div>

          <input
            className={styles.input}
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className={styles.input}
            type="password"
            name="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className={styles['button-confirm']}>
            {isLogin ? 'Acceder' : 'Registrarse'} →
          </button>

          <p style={{ fontSize: '0.9rem', marginTop: '10px', color: 'black' }}>
            {isLogin ? '¿No tienes cuenta?' : '¿Tienes una cuenta?'}{' '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              style={{
                color: 'blue',
                background: 'none',
                border: 'none',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              {isLogin ? 'Registrarse' : 'Iniciar Sesión'}
            </button>
          </p>
        </form>
      </div>
    </>
  )
}
