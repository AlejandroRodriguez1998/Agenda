import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

type Horario = {
  id: string
  asignatura_id: string
  tipo: 'teórica' | 'laboratorio'
  hora: string
  dias: string[]
}

type Props = {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
  horario?: Horario | null
}

type Asignatura = {
  id: string
  nombre: string
  curso: string
}

const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']

export default function ModalHorario({ visible, onClose, onSuccess, horario }: Props) {
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([])
  const [asignaturaId, setAsignaturaId] = useState('')
  const [tipo, setTipo] = useState<'teórica' | 'laboratorio'>('teórica')
  const [hora, setHora] = useState('')
  const [dias, setDias] = useState<string[]>([])

  useEffect(() => {
    supabase
      .from('asignaturas')
      .select('id, nombre, curso')
      .order('curso')
      .order('nombre')
      .then(({ data }) => {
        if (data) setAsignaturas(data)
      })
  }, [])

  useEffect(() => {
    if (horario) {
      setAsignaturaId(horario.asignatura_id)
      setTipo(horario.tipo)
      setHora(horario.hora)
      setDias(horario.dias || [])
    } else {
      setAsignaturaId('')
      setTipo('teórica')
      setHora('')
      setDias([])
    }
  }, [horario])

  const asignaturasPorCurso = asignaturas.reduce((acc, a) => {
    if (!acc[a.curso]) acc[a.curso] = []
    acc[a.curso].push(a)
    return acc
  }, {} as Record<string, Asignatura[]>)

  const toggleDia = (dia: string) => {
    if (dias.includes(dia)) {
      setDias(dias.filter(d => d !== dia))
    } else {
      setDias([...dias, dia])
    }
  }

  const guardar = async () => {
    if (!asignaturaId || !hora || dias.length === 0) {
      toast.error('Rellena todos los campos', {
        style: { background: '#1a1a1a', color: '#fff' },
      })
      return
    }

    const { data } = await supabase.auth.getSession()
    const user_id = data.session?.user?.id
    if (!user_id) return

    const payload = {
      user_id,
      asignatura_id: asignaturaId,
      tipo,
      hora,
      dias,
    }

    let error
    if (horario?.id) {
      ;({ error } = await supabase
        .from('horario')
        .update(payload)
        .eq('id', horario.id))
    } else {
      ;({ error } = await supabase.from('horario').insert(payload))
    }

    if (error) {
      toast.error('Error al guardar', {
        style: { background: '#1a1a1a', color: '#fff' },
      })
    } else {
      toast.success(horario?.id ? 'Horario actualizado' : 'Horario creado', {
        style: { background: '#1a1a1a', color: '#fff' },
      })
      onSuccess()
      onClose()
    }
  }

  if (!visible) return null

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content bg-dark text-white">
          <div className="modal-body">
            <h4 className="text-center mb-3">
              {horario ? 'Editar horario' : 'Nuevo horario'}
            </h4>

            <div className="mb-3">
              <label className="form-label">Asignatura</label>
              <select
                className="form-select"
                value={asignaturaId}
                onChange={(e) => setAsignaturaId(e.target.value)}
              >
                <option value="">Selecciona una asignatura</option>
                {Object.entries(asignaturasPorCurso).map(([curso, lista]) => (
                  <optgroup key={curso} label={`${curso}º curso`}>
                    {lista.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nombre}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Tipo de clase</label>
              <select
                className="form-select"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as 'teórica' | 'laboratorio')}
              >
                <option value="teórica">Teórica</option>
                <option value="laboratorio">Laboratorio</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Hora</label>
              <input
                type="time"
                className="form-control"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
              />
            </div>

            <div className="mb-3">
                <label className="form-label">Días</label>
                <div className="d-flex gap-2 flex-wrap">
                    {diasSemana.map((dia) => {
                    const abrev = dia.slice(0, 3).toUpperCase()
                    const activo = dias.includes(dia)
                    return (
                        <button
                        key={dia}
                        type="button"
                        onClick={() => toggleDia(dia)}
                        className={`btn btn-sm rounded-circle d-flex justify-content-center align-items-center ${
                            activo ? 'btn-primary' : 'btn-outline-secondary'
                        }`}
                        style={{
                            width: '40px',
                            height: '40px',
                            fontWeight: 'bold',
                            padding: 0,
                        }}
                        >
                        {abrev}
                        </button>
                    )
                    })}
                </div>
            </div>

            <div className="d-flex justify-content-center gap-2 mt-4">
              <button className="btn btn-primary w-100" onClick={guardar}>
                {horario ? 'Guardar cambios' : 'Crear horario'}
              </button>
              <button className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
