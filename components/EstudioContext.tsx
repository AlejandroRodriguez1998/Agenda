import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebaseClient'
import {
  actualizarEstudio,
  cargarOMigrarEstudios,
  crearEstudio,
  eliminarEstudioYDatos,
  type Estudio,
  type TipoEstudio,
} from '@/lib/estudios'

type EstudioContextValue = {
  estudios: Estudio[]
  estudioActivo: Estudio | null
  /** id del estudio activo (null mientras carga) */
  estudioId: string | null
  cargando: boolean
  error: string | null
  seleccionarEstudio: (id: string) => void
  nuevoEstudio: (datos: { nombre: string; tipo: TipoEstudio }) => Promise<void>
  editarEstudio: (id: string, datos: { nombre: string; tipo: TipoEstudio }) => Promise<void>
  borrarEstudio: (id: string) => Promise<void>
  /** true si un documento (asignatura, evento...) pertenece al estudio activo */
  esDelEstudioActivo: (item: { estudio_id?: string | null }) => boolean
}

const EstudioContext = createContext<EstudioContextValue | null>(null)

const claveStorage = (uid: string) => `agenda-estudio-${uid}`

const leerGuardado = (uid: string) => {
  try {
    return window.localStorage.getItem(claveStorage(uid))
  } catch {
    return null
  }
}

const guardar = (uid: string, id: string) => {
  try {
    window.localStorage.setItem(claveStorage(uid), id)
  } catch {
    /* sin storage: no pasa nada */
  }
}

export function EstudioProvider({ children }: { children: ReactNode }) {
  const [uid, setUid] = useState<string | null>(null)
  const [estudios, setEstudios] = useState<Estudio[]>([])
  const [estudioId, setEstudioId] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const inicializar = useCallback(async (userId: string) => {
    setCargando(true)
    setError(null)
    try {
      const lista = await cargarOMigrarEstudios(userId)
      setEstudios(lista)
      const guardado = leerGuardado(userId)
      setEstudioId(lista.some((e) => e.id === guardado) ? guardado : lista[0]?.id ?? null)
    } catch (err) {
      const firebaseError = err as { message?: string }
      setError(firebaseError.message || 'No se pudieron cargar tus estudios.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null)
      if (user) {
        inicializar(user.uid)
      } else {
        setEstudios([])
        setEstudioId(null)
        setCargando(false)
      }
    })
    return () => unsubscribe()
  }, [inicializar])

  const seleccionarEstudio = useCallback(
    (id: string) => {
      setEstudioId(id)
      if (uid) guardar(uid, id)
    },
    [uid]
  )

  const nuevoEstudio = useCallback(
    async (datos: { nombre: string; tipo: TipoEstudio }) => {
      if (!uid) return
      const creado = await crearEstudio(uid, datos)
      setEstudios((actual) => [...actual, creado])
      seleccionarEstudio(creado.id)
    },
    [uid, seleccionarEstudio]
  )

  const editarEstudio = useCallback(async (id: string, datos: { nombre: string; tipo: TipoEstudio }) => {
    await actualizarEstudio(id, datos)
    setEstudios((actual) => actual.map((e) => (e.id === id ? { ...e, nombre: datos.nombre.trim(), tipo: datos.tipo } : e)))
  }, [])

  const borrarEstudio = useCallback(
    async (id: string) => {
      if (!uid) return
      const estudio = estudios.find((e) => e.id === id)
      if (!estudio || estudios.length <= 1) return
      await eliminarEstudioYDatos(uid, id, !!estudio.por_defecto)
      const restantes = estudios.filter((e) => e.id !== id)
      setEstudios(restantes)
      if (estudioId === id) seleccionarEstudio(restantes[0].id)
    },
    [uid, estudios, estudioId, seleccionarEstudio]
  )

  const estudioPorDefectoId = estudios.find((e) => e.por_defecto)?.id ?? estudios[0]?.id ?? null

  const esDelEstudioActivo = useCallback(
    (item: { estudio_id?: string | null }) => !!estudioId && (item.estudio_id || estudioPorDefectoId) === estudioId,
    [estudioId, estudioPorDefectoId]
  )

  const value = useMemo<EstudioContextValue>(
    () => ({
      estudios,
      estudioActivo: estudios.find((e) => e.id === estudioId) ?? null,
      estudioId,
      cargando,
      error,
      seleccionarEstudio,
      nuevoEstudio,
      editarEstudio,
      borrarEstudio,
      esDelEstudioActivo,
    }),
    [estudios, estudioId, cargando, error, seleccionarEstudio, nuevoEstudio, editarEstudio, borrarEstudio, esDelEstudioActivo]
  )

  return <EstudioContext.Provider value={value}>{children}</EstudioContext.Provider>
}

export function useEstudio() {
  const ctx = useContext(EstudioContext)
  if (!ctx) throw new Error('useEstudio debe usarse dentro de <EstudioProvider>')
  return ctx
}
