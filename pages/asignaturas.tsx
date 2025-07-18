import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import ModalAsignatura from '@/components/ModalAsignatura'
import TopNav from '@/components/TopNav'
import Swal from 'sweetalert2'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

type Asignatura = {
  id: string
  nombre: string
  color?: string
}

export default function AsignaturasPage() {
  const router = useRouter()
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([])
  const [cargando, setCargando] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session?.user) {
        router.push('/login')
        return
      }

      await cargarAsignaturas()
    }

    cargar()
  }, [router])

  const cargarAsignaturas = async () => {
    setCargando(true)
    const { data } = await supabase
      .from('asignaturas')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setAsignaturas(data)
    setCargando(false)
  }

  const eliminarAsignatura = async (id: string) => {
    const confirmar = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la asignatura y no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })

    if (confirmar.isConfirmed) {
      const { error } = await supabase.from('asignaturas').delete().eq('id', id)
      if (!error) await cargarAsignaturas()
    }
  }

  return (
    <>
      <TopNav 
      title="📚 Asignaturas" 
      onAddClick={() => setModalVisible(true)} 
      />
      <div className="container mt-4">
        {cargando ? (
          <div className="text-center mt-4">
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : asignaturas.length === 0 ? (
          <p className="text-white text-center mt-4">No tienes asignaturas.</p>
        ) : (
          <ul className="list-group mt-4">
            {asignaturas.map((a) => (
              <li
                key={a.id}
                className="list-group-item d-flex justify-content-between align-items-center text-white mb-3"
                style={{
                  backgroundColor: a.color || '#343a40',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                }}
              >
                <span className="fw-semibold">{a.nombre}</span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => eliminarAsignatura(a.id)}
                >
                  <FontAwesomeIcon icon="trash" size="lg" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <ModalAsignatura
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSuccess={cargarAsignaturas} />
      </div>
    </>
  )
}
