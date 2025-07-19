// components/ModalAsignatura.tsx
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

type Props = {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ModalAsignatura({ visible, onClose, onSuccess }: Props) {
  const [nombre, setNombre] = useState('')
  const [color, setColor] = useState('#007bff')

  const handleGuardar = async () => {
    if (!nombre.trim()) return toast.error('Introduce un nombre')

    const { data: session } = await supabase.auth.getSession()
    const userId = session.session?.user?.id
    if (!userId) return toast.error('No hay sesión activa', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
        },
      })

    const { error } = await supabase
      .from('asignaturas')
      .insert({ nombre: nombre.trim(), color, user_id: userId })

    if (error) {
      toast.error(error.message, {
        style: {
          background: '#1a1a1a',
          color: '#fff',
        },
      })
    } else {
      toast.success('Asignatura añadida', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
        },
      })
      onSuccess()
      onClose()
      setNombre('')
      setColor('#007bff')
    }
  }

  if (!visible) return null

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content bg-dark text-white">
          <div className="modal-body">
            <div className="text-center mb-3">
              <h3 className="modal-title">Nueva asignatura</h3>
            </div>
            <div className="d-flex align-items-center mb-3">
              
              <input type="text" className="form-control me-2 flex-grow-1" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)}/>
              
              <input type="color" className="form-control form-control-color" value={color} onChange={(e) => setColor(e.target.value)} title="Color" style={{ width: '3rem', padding: 0 }}/>
            
            </div>
            <div className="d-flex justify-content-center gap-2 mt-4">
                <button className="btn btn-primary w-100" onClick={handleGuardar}>Añadir</button>
                <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
