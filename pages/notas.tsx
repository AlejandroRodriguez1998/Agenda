import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/router'

type Asignatura = {
  id: string
  nombre: string
  color: string
}

type Nota = {
  id: string
  tipo: string
  nota: number
  peso: number
  created_at: string
}

export default function NotasPage() {
  const router = useRouter()
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([])
  const [seleccionada, setSeleccionada] = useState<string | null>(null)
  const [notas, setNotas] = useState<Nota[]>([])
  const [tipo, setTipo] = useState('')
  const [nota, setNota] = useState('')
  const [peso, setPeso] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const verificarSesion = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session?.user) {
        router.push('/login')
      } else {
        await cargarAsignaturas()
      }
    }

    verificarSesion()
  }, [router])

  const cargarAsignaturas = async () => {
    const { data, error } = await supabase
      .from('asignaturas')
      .select('*')
      .order('nombre', { ascending: true })

    if (!error && data) setAsignaturas(data)
    setCargando(false)
  }

  const cargarNotas = async (asignaturaId: string) => {
    const { data, error } = await supabase
      .from('notas_academicas')
      .select('*')
      .eq('asignatura_id', asignaturaId)
      .order('created_at', { ascending: true })

    if (!error && data) setNotas(data)
  }

  const añadirNota = async () => {
    if (!tipo || !nota || !peso || !seleccionada) return
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData.session?.user?.id
    if (!userId) return

    const { error } = await supabase.from('notas_academicas').insert({
      user_id: userId,
      asignatura_id: seleccionada,
      tipo,
      nota: parseFloat(nota),
      peso: parseFloat(peso),
    })

    if (!error) {
      setTipo('')
      setNota('')
      setPeso('')
      cargarNotas(seleccionada)
    }
  }

  const eliminarNota = async (id: string) => {
    if (!seleccionada) return
    await supabase.from('notas_academicas').delete().eq('id', id)
    cargarNotas(seleccionada)
  }

  const notaFinal = notas.reduce((acc, n) => acc + n.nota * (n.peso / 100), 0).toFixed(2)
  const pesoTotal = notas.reduce((acc, n) => acc + n.peso, 0)

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">📊 Notas académicas</h2>

      <div className="mb-4">
        <select
          className="form-select"
          onChange={(e) => {
            setSeleccionada(e.target.value)
            cargarNotas(e.target.value)
          }}
          value={seleccionada || ''}
        >
          <option value="">Selecciona una asignatura</option>
          {asignaturas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </select>
      </div>

      {seleccionada && (
        <>
          <div className="row g-2 mb-4">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Tipo (Ej: Examen)"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <input
                type="number"
                className="form-control"
                placeholder="Nota (0–10)"
                min={0}
                max={10}
                value={nota}
                onChange={(e) => setNota(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <input
                type="number"
                className="form-control"
                placeholder="Peso (%)"
                min={1}
                max={100}
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <button className="btn btn-success w-100" onClick={añadirNota}>
                Añadir
              </button>
            </div>
          </div>

          {notas.length === 0 ? (
            <p className="text-muted text-center">No hay notas aún.</p>
          ) : (
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Tipo</th>
                  <th>Nota</th>
                  <th>Peso</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {notas.map((n) => (
                  <tr key={n.id}>
                    <td>{n.tipo}</td>
                    <td>{n.nota}</td>
                    <td>{n.peso}%</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => eliminarNota(n.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="table-light">
                <tr>
                  <td className="fw-bold">Final</td>
                  <td className="fw-bold">{notaFinal}</td>
                  <td className="fw-bold">{pesoTotal}%</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          )}
        </>
      )}
    </div>
  )
}
