import { useState } from 'react'
import Swal from 'sweetalert2'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faPen, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useEstudio } from './EstudioContext'
import { TIPOS_ESTUDIO, type Estudio, type TipoEstudio } from '@/lib/estudios'

const toastStyle = { style: { background: '#1a1a1a', color: '#fff' } }

type Formulario = { modo: 'crear' } | { modo: 'editar'; estudio: Estudio }

/** Lista de estudios (carrera, máster...) para el modal de Ajustes: cambiar, crear, editar y borrar. */
export default function EstudioSelector() {
  const { estudios, estudioActivo, seleccionarEstudio, nuevoEstudio, editarEstudio, borrarEstudio, cargando } = useEstudio()
  const [formulario, setFormulario] = useState<Formulario | null>(null)
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState<TipoEstudio>('Máster')
  const [guardando, setGuardando] = useState(false)

  const abrirCrear = () => {
    setNombre('')
    setTipo('Máster')
    setFormulario({ modo: 'crear' })
  }

  const abrirEditar = (estudio: Estudio) => {
    setNombre(estudio.nombre)
    setTipo(estudio.tipo)
    setFormulario({ modo: 'editar', estudio })
  }

  const guardar = async () => {
    if (!formulario) return
    if (!nombre.trim()) return toast.error('Ponle un nombre', toastStyle)
    setGuardando(true)
    try {
      if (formulario.modo === 'crear') {
        await nuevoEstudio({ nombre, tipo })
        toast.success(`${tipo} "${nombre.trim()}" creado`, toastStyle)
      } else {
        await editarEstudio(formulario.estudio.id, { nombre, tipo })
        toast.success('Estudio actualizado', toastStyle)
      }
      setFormulario(null)
    } catch (err) {
      const firebaseError = err as { message?: string }
      toast.error(firebaseError.message || 'No se pudo guardar', toastStyle)
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (estudio: Estudio) => {
    const confirmar = await Swal.fire({
      title: `¿Eliminar "${estudio.nombre}"?`,
      text: 'Se borrarán también sus asignaturas, horarios, tareas, notas y eventos. No se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar todo',
      cancelButtonText: 'Cancelar',
    })
    if (!confirmar.isConfirmed) return
    try {
      await borrarEstudio(estudio.id)
      setFormulario(null)
      toast.success('Estudio eliminado', toastStyle)
    } catch (err) {
      const firebaseError = err as { message?: string }
      toast.error(firebaseError.message || 'No se pudo eliminar', toastStyle)
    }
  }

  if (cargando && !estudioActivo) return null

  if (formulario) {
    return (
      <div className="estudio-form">
        <label className="form-label">Modalidad</label>
        <div className="estudio-tipos mb-3">
          {TIPOS_ESTUDIO.map((t) => (
            <button key={t} type="button" className={t === tipo ? 'is-active' : ''} onClick={() => setTipo(t)}>
              {t}
            </button>
          ))}
        </div>

        <label className="form-label">Nombre</label>
        <input
          type="text"
          className="form-control mb-3"
          placeholder={tipo === 'Máster' ? 'Ej. Máster en Ciencia de Datos' : 'Ej. Ingeniería Informática'}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && guardar()}
          autoFocus
        />

        <div className="d-flex gap-2">
          <button className="btn btn-primary w-100" onClick={guardar} disabled={guardando}>
            {formulario.modo === 'crear' ? 'Crear estudio' : 'Guardar'}
          </button>
          <button className="btn btn-secondary" onClick={() => setFormulario(null)}>
            Cancelar
          </button>
        </div>

        {formulario.modo === 'editar' && estudios.length > 1 && (
          <button className="btn btn-outline-secondary w-100 mt-2 estudio-borrar" onClick={() => eliminar(formulario.estudio)}>
            <FontAwesomeIcon icon={faTrash} /> Eliminar este estudio
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="estudio-lista" role="radiogroup" aria-label="Estudio activo">
      {estudios.map((estudio) => {
        const activo = estudio.id === estudioActivo?.id
        return (
          <div key={estudio.id} className={`estudio-lista__item ${activo ? 'is-active' : ''}`}>
            <button type="button" role="radio" aria-checked={activo} onClick={() => seleccionarEstudio(estudio.id)}>
              <span className="estudio-lista__check">{activo && <FontAwesomeIcon icon={faCheck} />}</span>
              <span className="estudio-lista__texto">
                <b>{estudio.nombre}</b>
                <small>{estudio.tipo}</small>
              </span>
            </button>
            <button type="button" className="estudio-lista__edit" onClick={() => abrirEditar(estudio)} aria-label={`Editar ${estudio.nombre}`}>
              <FontAwesomeIcon icon={faPen} />
            </button>
          </div>
        )
      })}
      <button type="button" className="estudio-lista__add" onClick={abrirCrear}>
        <FontAwesomeIcon icon={faPlus} /> Añadir estudio
      </button>
    </div>
  )
}
