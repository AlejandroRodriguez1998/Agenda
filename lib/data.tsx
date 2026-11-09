import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { collection, onSnapshot, query, where, type DocumentData } from 'firebase/firestore'
import { db } from './firebaseClient'
import { useAuth } from './auth'
import { useEstudio } from '@/components/EstudioContext'
import { PALETA, type Asignatura, type Evento, type Horario, type Nota, type Tarea } from './types'

type DataState = {
  asignaturas: Asignatura[]
  tareas: Tarea[]
  horarios: Horario[]
  notas: Nota[]
  eventos: Evento[]
  /** Asignaturas por id, con color siempre resuelto. */
  asignaturasMap: Map<string, Asignatura & { color: string }>
  cargando: boolean
  error: string | null
}

const empty: DataState = {
  asignaturas: [],
  tareas: [],
  horarios: [],
  notas: [],
  eventos: [],
  asignaturasMap: new Map(),
  cargando: true,
  error: null,
}

const DataContext = createContext<DataState>(empty)

type Collections = {
  asignaturas: Asignatura[]
  tareas: Tarea[]
  horario: Horario[]
  notas_academicas: Nota[]
  eventos: Evento[]
}

const COLLECTIONS = ['asignaturas', 'tareas', 'horario', 'notas_academicas', 'eventos'] as const

/** Convierte Timestamp de Firestore, string o número en milisegundos para ordenar. */
export const toMillis = (value: unknown): number => {
  if (!value) return 0
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Date.parse(value) || 0
  if (typeof value === 'object' && 'toMillis' in value && typeof value.toMillis === 'function') {
    return value.toMillis()
  }
  return 0
}

const compareText = (a = '', b = '') => a.localeCompare(b, 'es', { sensitivity: 'base' })

/**
 * Escucha en tiempo real todas las colecciones del usuario. Las consultas solo
 * filtran por `user_id` (sin orderBy), así no requieren índices compuestos y
 * no excluyen documentos antiguos a los que les falte algún campo.
 */
export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { esDelEstudioActivo, cargando: cargandoEstudios, error: errorEstudios } = useEstudio()
  const [raw, setRaw] = useState<Partial<Collections>>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setRaw({})
    setError(null)
    if (!user) return

    const unsubscribers = COLLECTIONS.map((name) =>
      onSnapshot(
        query(collection(db, name), where('user_id', '==', user.uid)),
        (snapshot) => {
          const docs = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data({ serverTimestamps: 'estimate' }) as DocumentData),
          }))
          setRaw((current) => ({ ...current, [name]: docs }))
        },
        (err) => {
          console.error(`Error escuchando ${name}`, err)
          setError(err.message || 'No se pudieron cargar los datos.')
          setRaw((current) => ({ ...current, [name]: current[name] ?? [] }))
        }
      )
    )

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe())
  }, [user])

  const value = useMemo<DataState>(() => {
    const asignaturas = (raw.asignaturas ?? []).filter(esDelEstudioActivo).sort(
      (a, b) => (a.curso ?? 99) - (b.curso ?? 99) || compareText(a.nombre, b.nombre)
    )
    const tareas = (raw.tareas ?? []).filter(esDelEstudioActivo).sort((a, b) => toMillis(b.created_at) - toMillis(a.created_at))
    const horarios = (raw.horario ?? []).filter(esDelEstudioActivo).sort((a, b) => compareText(a.hora, b.hora))
    const notas = (raw.notas_academicas ?? []).filter(esDelEstudioActivo).sort((a, b) => toMillis(a.created_at) - toMillis(b.created_at))
    const eventos = (raw.eventos ?? []).filter(esDelEstudioActivo).sort((a, b) => compareText(a.start, b.start))

    const asignaturasMap = new Map(
      asignaturas.map((asignatura, index) => [
        asignatura.id,
        { ...asignatura, color: asignatura.color || PALETA[index % PALETA.length] },
      ])
    )

    return {
      asignaturas,
      tareas,
      horarios,
      notas,
      eventos,
      asignaturasMap,
      cargando: !!user && (cargandoEstudios || COLLECTIONS.some((name) => raw[name] === undefined)),
      error: errorEstudios || error,
    }
  }, [raw, error, user, esDelEstudioActivo, cargandoEstudios, errorEstudios])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export const useData = () => useContext(DataContext)
