import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

type ModalNotaProps = {
  visible: boolean
  asignaturaId: string
  onClose: () => void
  onSuccess: () => void
}

export default function ModalNota({ visible, asignaturaId, onClose, onSuccess }: ModalNotaProps) {
  const [tipo, setTipo] = useState('')
  const [nota, setNota] = useState('')
  const [peso, setPeso] = useState('')

  const handleGuardar = async () => {
    if (!tipo || !nota || !peso) {
      toast.error('Rellena todos los campos', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
        },
      })
      return
    }

    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData.session?.user?.id
    if (!userId) {
      toast.error('No hay sesión activa', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
        },
      })
      return
    }

    const { error } = await supabase.from('notas_academicas').insert({
      user_id: userId,
      asignatura_id: asignaturaId,
      tipo,
      nota: parseFloat(nota),
      peso: parseFloat(peso),
    })

    if (!error) {
      toast.success('Nota añadida', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
        },
      })
      setTipo('')
      setNota('')
      setPeso('')
      onSuccess()
      onClose()
    } else {
      toast.error('Error al guardar nota', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
        },
      })
    }
  }

  if (!visible) return null

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content bg-dark text-white">
          <div className="modal-body">
            <div className="text-center">
              <h3 className="mb-0">Añadir nota</h3>
            </div>
            <div className="mb-3">
              <label className="form-label">Tipo</label>
              <input className="form-control" value={tipo} onChange={(e) => setTipo(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Nota</label>
              <input type="number" className="form-control" value={nota} onChange={(e) => setNota(e.target.value)} min={0} max={10} />
            </div>
            <div className="mb-3">
              <label className="form-label">Peso (%)</label>
              <input type="number" className="form-control" value={peso} onChange={(e) => setPeso(e.target.value)} min={1} max={100} />
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
