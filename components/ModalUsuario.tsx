// components/UserModal.tsx
import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebaseClient'
import Swal from 'sweetalert2'
import toast from 'react-hot-toast'
import { faCog } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  deleteUser,
  onAuthStateChanged,
  signOut,
  updatePassword,
  type User,
} from 'firebase/auth'

export default function ModalUsuario() {
  const [visible, setVisible] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })

    return () => unsubscribe()
  }, [])

  const cerrarSesion = async () => {
    await signOut(auth)
    localStorage.setItem('showLogoutToast', 'true')
    window.location.href = '/'
  }

  const borrarCuenta = async () => {
    const confirmar = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará tu cuenta permanentemente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })

    if (confirmar.isConfirmed) {
      if (!user) {
        return toast.error('No hay sesión activa', {
          style: {
            background: '#1a1a1a',
            color: '#fff',
          },
        })
      }

      try {
        await deleteUser(user)
        toast.success('Cuenta eliminada', {
          style: {
            background: '#1a1a1a',
            color: '#fff',
          },
        })
        window.location.href = '/'
      } catch (err) {
        const firebaseError = err as { code?: string; message?: string }
        const mensaje =
          firebaseError.code === 'auth/requires-recent-login'
            ? 'Vuelve a iniciar sesión para eliminar tu cuenta'
            : firebaseError.message || 'No se pudo eliminar la cuenta'
        toast.error(mensaje, {
          style: {
            background: '#1a1a1a',
            color: '#fff',
          },
        })
      }
    }
  }

  const cambiarContrasena = async () => {
    if (!newPassword || newPassword.length < 6) {
      return toast.error('La contrasena debe tener al menos 6 caracteres', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
        },
      })
    }

    if (!user) {
      return toast.error('No hay sesión activa', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
        },
      })
    }

    try {
      await updatePassword(user, newPassword)
      toast.success('Contrasena actualizada', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
        },
      })
    } catch (err) {
      const firebaseError = err as { message?: string }
      toast.error(firebaseError.message || 'No se pudo actualizar la contrasena', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
        },
      })
    }
  }

  const handleClose = () => setVisible(false)

  return (
    <>
      <button className="btn btn-link text-white p-0" onClick={() => setVisible(true)}>
        <FontAwesomeIcon icon={faCog} size="lg" />
      </button>

      {visible && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={handleClose}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-dark text-white">
              <div className="modal-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="modal-title mb-0">👤 Usuario</h5>
                  <button className="btn btn-outline-light" onClick={cerrarSesion}>
                    Cerrar sesión
                  </button>
                </div>

                <h4 className="text-white text-center my-4">
                  <strong> {user?.email ?? ''}</strong>
                </h4>

                <label className="form-label">Nueva contrasena</label>
                <input
                  type="password"
                  className="form-control mb-3"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="********"
                />

                <button className="btn btn-primary w-100 mb-2" onClick={cambiarContrasena}>
                  Cambiar contrasena
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
