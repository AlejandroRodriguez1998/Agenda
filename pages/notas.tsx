import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import TopNav from '@/components/TopNav'
import ModalNota from '@/components/ModalNota'
import Swal from 'sweetalert2'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

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
  asignatura_id: string
}

export default function NotasPage() {
  const router = useRouter()
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([])
  const [seleccionada, setSeleccionada] = useState<string | null>(null)
  const [notas, setNotas] = useState<Nota[]>([])
  const [notasPorAsignatura, setNotasPorAsignatura] = useState<Record<string, Nota[]>>({})
  const [cargando, setCargando] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    const verificarSesion = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session?.user) {
        router.push('/login')
      } else {
        await cargarAsignaturasYNotas()
      }
    }

    verificarSesion()
  }, [router])

  const cargarAsignaturasYNotas = async () => {
    setCargando(true)

    const { data: asignaturasData } = await supabase
      .from('asignaturas')
      .select('*')
      .order('nombre', { ascending: true })

    const { data: notasData } = await supabase
      .from('notas_academicas')
      .select('*')
      .order('created_at', { ascending: true })

    if (asignaturasData && notasData) {
      setAsignaturas(asignaturasData)
      const agrupadas = asignaturasData.reduce((acc, asignatura) => {
        acc[asignatura.id] = notasData.filter(n => n.asignatura_id === asignatura.id)
        return acc
      }, {} as Record<string, Nota[]>)

      setNotasPorAsignatura(agrupadas)

      if (seleccionada) {
        setNotas(agrupadas[seleccionada] || [])
      }
    }

    setCargando(false)
  }

  const cargarNotas = async (asignaturaId: string) => {
    const { data } = await supabase
      .from('notas_academicas')
      .select('*')
      .eq('asignatura_id', asignaturaId)
      .order('created_at', { ascending: true })

    if (data) setNotas(data)
  }

  const eliminarNota = async (id: string) => {
    const confirmar = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })

    if (confirmar.isConfirmed) {
      await supabase.from('notas_academicas').delete().eq('id', id)
      await cargarAsignaturasYNotas()
    }
  }

  const calcularNotaFinal = (notas: Nota[]) => {
    const pesoTotal = notas.reduce((acc, n) => acc + n.peso, 0)
    if (pesoTotal === 0) return 0
    return notas.reduce((acc, n) => acc + n.nota * (n.peso / 100), 0)
  }

  const notasFinales = asignaturas.map((a) => {
    const notas = notasPorAsignatura[a.id] || []
    return {
      asignatura: a,
      final: calcularNotaFinal(notas),
    }
  }).filter(n => n.final > 0)

  const mediaGlobal =
    notasFinales.length > 0
      ? (notasFinales.reduce((acc, n) => acc + n.final, 0) / notasFinales.length).toFixed(2)
      : null

  return (
    <>
      <TopNav
        title="📊 Notas"
        showAdd={!!seleccionada}
        onAddClick={() => setModalVisible(true)}
      />

      <div className="container mt-4">
        <div className="mb-4">
          <select
            className="form-select"
            onChange={(e) => {
              setSeleccionada(e.target.value)
              if (e.target.value) cargarNotas(e.target.value)
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

        {!seleccionada && (
          <>
            {mediaGlobal ? (
              <div className="text-center mb-4">
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    backgroundColor: '#0d6efd',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: 28,
                    fontWeight: 'bold',
                    margin: '0 auto 1rem',
                  }}
                >
                  {mediaGlobal}
                </div>
                <p className="text-white">Media global de todas las asignaturas</p>
              </div>
            ) : (
              <p className="text-white text-center">No hay notas aún.</p>
            )}

            {notasFinales.map(({ asignatura, final }) => (
              <div
                key={asignatura.id}
                className="d-flex justify-content-between align-items-center mb-2 text-white p-3 rounded"
                style={{ backgroundColor: asignatura.color || '#343a40' }}
              >
                <strong>{asignatura.nombre}</strong>
                <span className="badge bg-light text-dark">{final.toFixed(2)}</span>
              </div>
            ))}
          </>
        )}

        {seleccionada && (
          <>
            {notas.length === 0 ? (
              <p className="text-white text-center">No hay notas aún.</p>
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
                          className="btn btn-secondary btn-sm"
                          onClick={() => eliminarNota(n.id)}
                        >
                          <FontAwesomeIcon icon="trash" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="table-light">
                  <tr>
                    <td className="fw-bold">Final</td>
                    <td className="fw-bold">{calcularNotaFinal(notas).toFixed(2)}</td>
                    <td className="fw-bold">
                      {notas.reduce((acc, n) => acc + n.peso, 0)}%
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            )}

            <ModalNota
              visible={modalVisible}
              asignaturaId={seleccionada}
              onClose={() => setModalVisible(false)}
              onSuccess={cargarAsignaturasYNotas}
            />
          </>
        )}
      </div>
    </>
  )
}
