import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import toast from 'react-hot-toast'

type TareaModalProps = {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
  tarea?: {
    id: string
    titulo: string
    fecha_entrega: string
    asignatura_id: string
  }
}

const MySwal = withReactContent(Swal)

export default function ModalTarea({ visible, onClose, onSuccess, tarea }: TareaModalProps) {
  const [asignaturas, setAsignaturas] = useState<{ id: string; nombre: string }[]>([])

  useEffect(() => {
    if (!visible) return

    const fetchAndOpen = async () => {
      const { data } = await supabase.from('asignaturas').select('id, nombre')
      if (data) {
        setAsignaturas(data)
        abrirModal(data)
      }
    }

    fetchAndOpen()
  }, [visible])

  const abrirModal = (asignaturas: { id: string; nombre: string }[]) => {
    const asignaturaDefault = tarea?.asignatura_id ?? ''
    const tituloDefault = tarea?.titulo ?? ''
    const fechaDefault = tarea?.fecha_entrega ?? ''

    const formatearFecha = (fechaISO: string) => {
      try {
        return new Date(fechaISO).toISOString().split('T')[0]
      } catch {
        return ''
      }
    }

    MySwal.fire({
      title: tarea ? 'Editar tarea' : 'Nueva tarea',
      html: `<div style="display: flex; flex-direction: column; gap: 10px;">
        <select id="swal-asignatura" style="width: 100%; padding: 14px; font-size: 1rem;">
        <option value="">Selecciona una asignatura</option>
        ${asignaturas
            .map(
            (a) =>
                `<option value="${a.id}" ${a.id === asignaturaDefault ? 'selected' : ''}>${a.nombre}</option>`
            )
            .join('')}
        </select>
        <input id="swal-titulo" placeholder="Título" style="width: 100%; padding: 14px; font-size: 1rem;" />
        <input id="swal-fecha" type="date" style="width: 100%; padding: 14px; font-size: 1rem;" />
      </div>`,
      didOpen: () => {
        const tituloInput = document.getElementById('swal-titulo') as HTMLInputElement
        const fechaInput = document.getElementById('swal-fecha') as HTMLInputElement

        if (tituloInput) tituloInput.value = tituloDefault
        if (fechaInput && fechaDefault) fechaInput.value = formatearFecha(fechaDefault)
      },
      showCancelButton: true,
      confirmButtonText: tarea ? 'Guardar cambios' : 'Crear tarea',
      cancelButtonText: 'Cancelar',
      background: '#1e1e1e',
      color: '#fff',
      customClass: {
        popup: 'rounded',
      },
      preConfirm: async () => {
        const asignaturaId = (document.getElementById('swal-asignatura') as HTMLSelectElement).value
        const titulo = (document.getElementById('swal-titulo') as HTMLInputElement).value.trim()
        const fecha = (document.getElementById('swal-fecha') as HTMLInputElement).value

        if (!titulo || !asignaturaId) {
          Swal.showValidationMessage('Debes rellenar todos los campos obligatorios')
          return false
        }

        const { data: session } = await supabase.auth.getSession()
        const userId = session.session?.user?.id
        if (!userId) {
          Swal.showValidationMessage('No hay sesión activa')
          return false
        }

        const payload = {
          titulo,
          fecha_entrega: fecha,
          asignatura_id: asignaturaId,
          user_id: userId,
        }

        const { error } = tarea
          ? await supabase.from('tareas').update(payload).eq('id', tarea.id)
          : await supabase.from('tareas').insert(payload)

        if (error) {
          Swal.showValidationMessage(error.message)
          return false
        }

        return true
      },
    }).then((result) => {
      if (result.isConfirmed) {
        toast.success(tarea ? 'Tarea actualizada' : 'Tarea creada')
        onSuccess()
      }
      onClose()
    })
  }

  return null
}
