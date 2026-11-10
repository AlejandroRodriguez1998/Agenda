import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faCalendarDays,
  faChartColumn,
  faEnvelope,
  faEye,
  faEyeSlash,
  faGraduationCap,
  faListCheck,
  faLock,
} from '@fortawesome/free-solid-svg-icons'
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { auth } from '@/lib/firebaseClient'
import styles from './AuthForm.module.css'

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

const VENTAJAS = [
  { icon: faCalendarDays, text: 'Clases, entregas y eventos en un calendario' },
  { icon: faListCheck, text: 'Tareas ordenadas por urgencia' },
  { icon: faChartColumn, text: 'Medias ponderadas al instante' },
]

export default function AuthForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [verPassword, setVerPassword] = useState(false)
  const [enviando, setEnviando] = useState(false)

  // /login?modo=registro abre directamente la pestaña de crear cuenta.
  useEffect(() => {
    if (router.isReady) setIsLogin(router.query.modo !== 'registro')
  }, [router.isReady, router.query.modo])

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
        <title>{isLogin ? 'Iniciar sesión · Agenda' : 'Crear cuenta · Agenda'}</title>
      </Head>

      <div className={styles.page}>
        <aside className={styles.brandPanel}>
          <span className={`${styles.blob} ${styles.blob1}`} aria-hidden="true" />
          <span className={`${styles.blob} ${styles.blob2}`} aria-hidden="true" />

          <div className={styles.topRow}>
            <Link href="/" className={styles.back} aria-label="Volver al inicio">
              <FontAwesomeIcon icon={faArrowLeft} />
            </Link>
            <Link href="/" className={styles.brand}>
              <span className={styles.brandMark}><FontAwesomeIcon icon={faGraduationCap} /></span>
              Agenda
            </Link>
          </div>

          <div className={styles.copy}>
            <h1>{isLogin ? 'Hola de nuevo 👋' : 'Empieza a organizarte'}</h1>
            <p>
              {isLogin
                ? 'Entra para ver tu semana, tus tareas y tus notas.'
                : 'Crea tu cuenta gratis y ten todo tu curso en un solo sitio.'}
            </p>
            <ul className={styles.perks}>
              {VENTAJAS.map((v) => (
                <li key={v.text}>
                  <span><FontAwesomeIcon icon={v.icon} /></span>
                  {v.text}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className={styles.formArea}>
          <form className={styles.card} onSubmit={handleSubmit}>
            <div className="segmented segmented--full" role="tablist" aria-label="Acceso">
              <button type="button" role="tab" aria-selected={isLogin} className={isLogin ? 'is-active' : ''} onClick={() => setIsLogin(true)}>
                Entrar
              </button>
              <button type="button" role="tab" aria-selected={!isLogin} className={!isLogin ? 'is-active' : ''} onClick={() => setIsLogin(false)}>
                Crear cuenta
              </button>
            </div>

            <div className={styles.heading}>
              <h2>{isLogin ? 'Inicia sesión' : 'Crea tu cuenta'}</h2>
              <p>{isLogin ? 'Usa tu correo y tu contraseña.' : 'Te enviaremos un correo para verificarla.'}</p>
            </div>

            <label className="field">
              <span className="field__label">Correo electrónico</span>
              <span className={styles.inputWrap}>
                <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
                <input
                  className={`input ${styles.input}`}
                  type="email"
                  name="email"
                  placeholder="tu@correo.com"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </span>
            </label>

            <label className="field">
              <span className="field__label">Contraseña</span>
              <span className={styles.inputWrap}>
                <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
                <input
                  className={`input ${styles.input}`}
                  type={verPassword ? 'text' : 'password'}
                  name="password"
                  placeholder={isLogin ? 'Tu contraseña' : 'Mínimo 6 caracteres'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={styles.eye}
                  onClick={() => setVerPassword((v) => !v)}
                  aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <FontAwesomeIcon icon={verPassword ? faEyeSlash : faEye} />
                </button>
              </span>
            </label>

            {isLogin && (
              <button type="button" className={styles.forgot} onClick={recuperar}>
                ¿Has olvidado la contraseña?
              </button>
            )}

            <button type="submit" className={`btn btn--primary btn--block ${styles.submit}`} disabled={enviando}>
              {enviando ? 'Un momento…' : isLogin ? 'Entrar' : 'Crear cuenta'}
            </button>

            <p className={styles.switch}>
              {isLogin ? '¿Aún no tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
              <button type="button" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Créala gratis' : 'Inicia sesión'}
              </button>
            </p>
          </form>
        </main>
      </div>
    </>
  )
}
