import { useState } from 'react'
import Link from 'next/link'
import { auth } from '@/lib/firebaseClient'
import styles from './AuthForm.module.css'
import toast from 'react-hot-toast'
import Head from 'next/head'
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth'

const ERRORES: Record<string, string> = {
  'auth/invalid-credential': 'Correo o contraseña incorrectos',
  'auth/wrong-password': 'Correo o contraseña incorrectos',
  'auth/user-not-found': 'Correo o contraseña incorrectos',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese correo',
  'auth/invalid-email': 'El correo no es válido',
  'auth/missing-email': 'Escribe tu correo',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
  'auth/too-many-requests': 'Demasiados intentos. Inténtalo más tarde',
  'auth/network-request-failed': 'Sin conexión a internet',
}

const traducirError = (err: unknown) => ERRORES[(err as { code?: string })?.code ?? ''] || 'Algo ha fallado. Inténtalo de nuevo'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [enviando, setEnviando] = useState(false)

  // Tras iniciar sesión, pages/login.tsx redirige al detectar el usuario.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email.trim(), password)
        toast.success('¡Bienvenido! 👋')
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
        await sendEmailVerification(cred.user, { url: `${window.location.origin}/verificar` })
        toast.success('Cuenta creada. Revisa tu correo para verificarla', { duration: 6000 })
      }
    } catch (err) {
      toast.error(traducirError(err))
    } finally {
      setEnviando(false)
    }
  }

  const recuperar = async () => {
    if (!email.trim()) return void toast.error('Escribe tu correo arriba y vuelve a pulsar')
    try {
      await sendPasswordResetEmail(auth, email.trim())
      toast.success('Si el correo existe, recibirás un enlace para restablecerla', { duration: 6000 })
    } catch (err) {
      toast.error(traducirError(err))
    }
  }

  return (
    <>
      <Head>
        <title>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</title>
      </Head>

      <div className={styles.wrapper}>
        <header className={styles.publicNav}>
          <Link href="/" className={styles.brandButton}>
            <span className={styles.brandMark}>A</span>
            <b>Agenda Académica</b>
          </Link>
          <Link href="/" className={styles.backButton}>
            Volver
          </Link>
        </header>

        <section className={styles.panel}>
          <div className={styles.copy}>
            <span>{isLogin ? 'Acceso privado' : 'Nueva cuenta'}</span>
            <h1>{isLogin ? 'Bienvenido de nuevo' : 'Crea tu espacio académico'}</h1>
            <p>
              {isLogin
                ? 'Accede a tus horarios, tareas y notas desde tu dashboard.'
                : 'Empieza a organizar tus asignaturas, entregas y calificaciones.'}
            </p>
            <div className={styles.copyList}>
              <div>
                <strong>Horario</strong>
                <span>Clases y eventos</span>
              </div>
              <div>
                <strong>Tareas</strong>
                <span>Pendientes claros</span>
              </div>
              <div>
                <strong>Notas</strong>
                <span>Medias por asignatura</span>
              </div>
            </div>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.title}>
            {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
            <span>{isLogin ? 'Usa tu correo y contraseña' : 'Te enviaremos un correo de verificación'}</span>
          </div>

          <input
            className={styles.input}
            type="email"
            name="email"
            placeholder="Correo electrónico"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className={styles.input}
            type="password"
            name="password"
            placeholder="Contraseña"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className={styles['button-confirm']} disabled={enviando}>
            {enviando ? 'Un momento…' : isLogin ? 'Acceder' : 'Crear cuenta'}
          </button>

          {isLogin && (
            <p className={styles.switchText}>
              <button type="button" onClick={recuperar}>¿Has olvidado la contraseña?</button>
            </p>
          )}

          <p className={styles.switchText}>
            {isLogin ? '¿No tienes cuenta?' : '¿Tienes una cuenta?'}{' '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Registrarse' : 'Iniciar Sesión'}
            </button>
          </p>
        </form>
        </section>
      </div>
    </>
  )
}
