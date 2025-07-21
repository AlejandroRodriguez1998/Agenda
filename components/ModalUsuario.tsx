// components/UserModal.tsx
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Swal from 'sweetalert2'
import toast from 'react-hot-toast'
import { faCog } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function ModalUsuario() {
  const [visible, setVisible] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(null)

  useEffect(() => {
    const cargarUsuario = async () => {
        const { data } = await supabase.auth.getUser()
        setUser(data.user)
    }

    cargarUsuario()
  }, [visible]) 

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    localStorage.setItem('showLogoutToast', 'true')
    window.location.href = '/'
  }

  const borrarCuenta = async () => {

    /*  <div className="d-flex justify-content-start mt-5 mb-3">
                            <button className="btn btn-danger" onClick={borrarCuenta}>Borrar cuenta</button>
                        </div>
    */

    const confirmar = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará tu cuenta permanentemente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })

    if (confirmar.isConfirmed) {
      const { data } = await supabase.auth.getSession()
      const user = data.session?.user
      if (!user) return toast.error('No hay sesión activa', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
        },
      })

      const { error } = await supabase.rpc('delete_user_by_id', { user_id: user.id })
      if (error) toast.error(error.message, {
        style: {
          background: '#1a1a1a',
          color: '#fff',
        },
      })
      else {
        toast.success('Cuenta eliminada', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
        },
      })
        await cerrarSesion()
      }
    }
  }

  const cambiarContraseña = async () => {
    if (!newPassword || newPassword.length < 6) {
      return toast.error('La contraseña debe tener al menos 6 caracteres', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
        },
      })
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) toast.error(error.message, {
        style: {
          background: '#1a1a1a',
          color: '#fff',
        },
      })
    else toast.success('Contraseña actualizada', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
        },
      })
  }

  const handleClose = () => setVisible(false);

  return (
    <>
      <button className="btn btn-link text-white p-0" onClick={() => setVisible(true)}>
        <FontAwesomeIcon icon={faCog} size="lg" />
      </button>

      {visible && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={handleClose}>
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

                        <label className="form-label">Nueva contraseña</label>
                        <input type="password" className="form-control mb-3" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="********"/>

                        <button className="btn btn-primary w-100 mb-2" onClick={cambiarContraseña}>Cambiar contraseña</button>

                    </div>
                </div>
            </div>
        </div>
      )}
    </>
  )
}
