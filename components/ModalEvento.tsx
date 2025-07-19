import { useEffect, useState } from 'react'
import { EventInput } from '@fullcalendar/core'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

type ModalEventoProps = {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
  userId: string
  fechaPorDefecto: string
  evento: EventInput | null
}

export default function ModalEvento({
  visible,
  onClose,
  onSuccess,
  userId,
  fechaPorDefecto,
  evento
}: ModalEventoProps) {
  const [titulo, setTitulo] = useState('')
  const [color, setColor] = useState('#0d6efd')

  useEffect(() => {
    if (evento) {
      setTitulo(evento.title || '')
      setColor(evento.color?.toString() || '#0d6efd')
    } else {
      setTitulo('')
      setColor('#0d6efd')
    }
  }, [evento])

  const guardarEvento = async () => {
    if (!titulo.trim()) {
        toast.error('El título no puede estar vacío', {
            style: {
            background: '#1a1a1a',
            color: '#fff',
            },
        })
      return
    }

    if (evento?.id) {
      // Editar
      const { error } = await supabase
        .from('eventos')
        .update({ title: titulo, color })
        .eq('id', evento.id)

      if (error) {
        toast.error('No se pudo actualizar el evento', {
          style: {
            background: '#1a1a1a',
            color: '#fff',
          },
        })
      } else {
        onSuccess()
        onClose()
      }
    } else {
      // Añadir
      const { error } = await supabase.from('eventos').insert({
        user_id: userId,
        title: titulo,
        start: fechaPorDefecto,
        color
      })

      if (error) {
       toast.error('No se pudo crear el evento', {
          style: { 
            background: '#1a1a1a',
            color: '#fff',
          },
        })
      } else {
        setTitulo('')
        setColor('#0d6efd')
        onSuccess()
        onClose()
      }
    }
  }

  if (!visible) return null

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content bg-dark text-white">
          <div className="modal-body">
            <div className="text-center mb-3">
              <h3 className="modal-title">
                {evento ? 'Editar evento' : 'Nuevo evento'}
              </h3>
            </div>
            
            <div className="d-flex align-items-center mb-3">

                <input type="text" className="form-control me-2 flex-grow-1" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Examen de historia"/>

                <input type="color" className="form-control form-control-color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: '3rem', padding: 0 }} title="Color del evento"/>
            
            </div>
            <div className="d-flex justify-content-center gap-2 mt-4">
                <button className="btn btn-primary w-100" onClick={guardarEvento}>
                    {evento ? 'Guardar cambios' : 'Crear evento'}
                </button>
                <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
