import { useState } from 'react'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faPen, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useEstudio } from './EstudioContext'
import { TIPOS_ESTUDIO, type Estudio, type TipoEstudio } from '@/lib/estudios'
import { confirmar } from '@/lib/ui'

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
    if (!formulario || guardando) return
    if (!nombre.trim()) return toast.error('Ponle un nombre')
    setGuardando(true)
    try {
      if (formulario.modo === 'crear') {
        await nuevoEstudio({ nombre, tipo })
        toast.success(`${tipo} "${nombre.trim()}" creado`)
      } else {
        await editarEstudio(formulario.estudio.id, { nombre, tipo })
        toast.success('Estudio actualizado')
      }
      setFormulario(null)
    } catch (err) {
      const firebaseError = err as { message?: string }
      toast.error(firebaseError.message || 'No se pudo guardar')
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (estudio: Estudio) => {
    const confirmado = await confirmar({
      title: `¿Eliminar "${estudio.nombre}"?`,
      text: 'Se borrarán también sus asignaturas, horarios, tareas, notas y eventos. No se puede deshacer.',
      confirmText: 'Sí, eliminar todo',
    })
    if (!confirmado) return
    try {
      await borrarEstudio(estudio.id)
      setFormulario(null)
      toast.success('Estudio eliminado')
    } catch (err) {
      const firebaseError = err as { message?: string }
      toast.error(firebaseError.message || 'No se pudo eliminar')
    }
  }

  if (cargando && !estudioActivo) return null

  if (formulario) {
    return (
      <form className="estudio-form" onSubmit={(event) => { event.preventDefault(); void guardar() }}>
        <span className="field__label" id="estudio-modalidad">Modalidad</span>
        <div className="estudio-tipos" role="group" aria-labelledby="estudio-modalidad">
          {TIPOS_ESTUDIO.map((t) => (
            <button key={t} type="button" className={t === tipo ? 'is-active' : ''} onClick={() => setTipo(t)} aria-pressed={t === tipo}>
              {t}
            </button>
          ))}
        </div>

        <label className="field__label" htmlFor="estudio-nombre">Nombre</label>
        <input
          id="estudio-nombre"
          type="text"
          className="input"
          maxLength={120}
          placeholder={tipo === 'Máster' ? 'Ej. Máster en Ciencia de Datos' : 'Ej. Ingeniería Informática'}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          autoFocus
        />

        <div className="estudio-form__actions">
          <button type="submit" className="btn btn--primary" disabled={guardando}>
            {formulario.modo === 'crear' ? 'Crear estudio' : 'Guardar'}
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => setFormulario(null)} disabled={guardando}>
            Cancelar
          </button>
        </div>

        {formulario.modo === 'editar' && estudios.length > 1 && (
          <button type="button" className="btn btn--danger-soft btn--block" onClick={() => eliminar(formulario.estudio)} disabled={guardando}>
            <FontAwesomeIcon icon={faTrash} /> Eliminar este estudio
          </button>
        )}
      </form>
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
