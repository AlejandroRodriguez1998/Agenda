import { useState } from 'react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoon, faRightFromBracket, faSun } from '@fortawesome/free-solid-svg-icons'
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth'
import Modal, { Field } from './Modal'
import { cerrarSesion, nombreVisible, useAuth } from '@/lib/auth'
import { useTheme } from '@/lib/theme'

export const iniciales = (nombre?: string | null, email?: string | null) =>
  (nombre || email?.split('@')[0] || '?').slice(0, 2).toUpperCase()

export default function ModalUsuario({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [guardando, setGuardando] = useState(false)

  const cambiarContrasena = async () => {
    if (!user?.email) return
    if (nueva.length < 6) return toast.error('La contraseña debe tener al menos 6 caracteres')
    if (!actual) return toast.error('Introduce tu contraseña actual')

    setGuardando(true)
    try {
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, actual))
      await updatePassword(user, nueva)
      toast.success('Contraseña actualizada')
      setActual('')
      setNueva('')
    } catch (err) {
      const code = (err as { code?: string }).code
      toast.error(
        code === 'auth/invalid-credential' || code === 'auth/wrong-password'
          ? 'La contraseña actual no es correcta'
          : code === 'auth/too-many-requests'
            ? 'Demasiados intentos. Inténtalo más tarde'
            : 'No se pudo actualizar la contraseña'
      )
    } finally {
      setGuardando(false)
    }
  }

  const salir = async () => {
    onClose()
    await cerrarSesion()
    router.replace('/')
  }

  return (
    <Modal open={open} onClose={onClose} title="Ajustes">
      <div className="profile-card">
        <span className="avatar avatar--lg">{iniciales(user?.displayName, user?.email)}</span>
        <div>
          <strong>{nombreVisible(user)}</strong>
          <span>{user?.email}</span>
        </div>
      </div>

      <section className="settings-group">
        <h3>Apariencia</h3>
        <div className="segmented segmented--full" role="radiogroup" aria-label="Tema">
          <button type="button" role="radio" aria-checked={theme === 'light'} className={theme === 'light' ? 'is-active' : ''} onClick={() => setTheme('light')}>
            <FontAwesomeIcon icon={faSun} /> Claro
          </button>
          <button type="button" role="radio" aria-checked={theme === 'dark'} className={theme === 'dark' ? 'is-active' : ''} onClick={() => setTheme('dark')}>
            <FontAwesomeIcon icon={faMoon} /> Oscuro
          </button>
        </div>
      </section>

      <form
        className="settings-group"
        onSubmit={(event) => {
          event.preventDefault()
          cambiarContrasena()
        }}
      >
        <h3>Cambiar contraseña</h3>
        <input type="email" autoComplete="username" value={user?.email ?? ''} readOnly hidden />
        <Field label="Contraseña actual">
          <input className="input" type="password" autoComplete="current-password" value={actual} onChange={(e) => setActual(e.target.value)} />
        </Field>
        <Field label="Nueva contraseña" hint="Mínimo 6 caracteres">
          <input className="input" type="password" autoComplete="new-password" value={nueva} onChange={(e) => setNueva(e.target.value)} />
        </Field>
        <button type="submit" className="btn btn--secondary btn--block" disabled={guardando || !actual || !nueva}>
          {guardando ? 'Guardando…' : 'Actualizar contraseña'}
        </button>
      </form>

      <button type="button" className="btn btn--danger-soft btn--block" onClick={salir}>
        <FontAwesomeIcon icon={faRightFromBracket} /> Cerrar sesión
      </button>
    </Modal>
  )
}
