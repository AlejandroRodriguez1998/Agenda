// Tipos de las colecciones de Firestore. Los nombres de campos coinciden
// exactamente con los documentos existentes: no renombrar.

export type Asignatura = {
  id: string
  nombre: string
  color?: string
  curso?: number
  user_id: string
}

export type Tarea = {
  id: string
  titulo: string
  completada: boolean
  fecha_entrega?: string | null
  asignatura_id: string
  user_id: string
  created_at?: unknown
}

export type TipoClase = 'teórica' | 'laboratorio'

export type Horario = {
  id: string
  asignatura_id: string
  tipo: TipoClase | string
  hora: string
  dias: string[]
  user_id: string
}

export type Nota = {
  id: string
  tipo: string
  nota: number
  peso: number
  asignatura_id: string
  user_id: string
  created_at?: unknown
}

export type Evento = {
  id: string
  title: string
  start: string
  color?: string
  user_id: string
}

export const DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'] as const

export const PALETA = ['#6c63ff', '#3b82f6', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4', '#a855f7', '#ec4899']

export const COLOR_POR_DEFECTO = '#6c63ff'
