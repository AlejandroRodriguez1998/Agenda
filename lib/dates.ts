import { DIAS_SEMANA } from './types'

/** Clave YYYY-MM-DD en hora local (mismo formato que `fecha_entrega` y `start`). */
export const toDateKey = (date: Date) => date.toLocaleDateString('en-CA')

export const todayKey = () => toDateKey(new Date())

/** Convierte una clave YYYY-MM-DD en Date a mediodía para evitar saltos por zona horaria. */
export const fromDateKey = (key: string) => new Date(`${key}T12:00:00`)

export const addDays = (date: Date, days: number) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export const startOfWeek = (date: Date) => addDays(date, 1 - (date.getDay() || 7))

export const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

export const formatDate = (date: Date, options: Intl.DateTimeFormatOptions) =>
  date.toLocaleDateString('es-ES', options)

/** Nombre del día en el formato guardado en `horario.dias` ('lunes', 'miércoles'...). */
export const nombreDia = (date: Date) => DIAS_SEMANA[(date.getDay() + 6) % 7]

/** 'HH:mm' → horas decimales. */
export const parseHour = (value?: string) => {
  const match = value?.match(/(\d{1,2})(?::(\d{2}))?/)
  if (!match) return 9
  return Number(match[1]) + Number(match[2] || 0) / 60
}

/** 42 días (6 semanas) empezando en el lunes anterior al día 1 del mes. */
export const monthGrid = (date: Date) => {
  const first = new Date(date.getFullYear(), date.getMonth(), 1)
  const start = addDays(first, -((first.getDay() + 6) % 7))
  return Array.from({ length: 42 }, (_, index) => addDays(start, index))
}

/** Días que faltan desde hoy hasta la fecha (negativo si ya pasó). */
export const daysUntil = (key: string) => {
  const today = fromDateKey(todayKey()).getTime()
  return Math.round((fromDateKey(key).getTime() - today) / 86_400_000)
}

export const describeDue = (key: string) => {
  const diff = daysUntil(key)
  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Mañana'
  if (diff === -1) return 'Ayer'
  if (diff < 0) return `Hace ${-diff} días`
  if (diff < 7) return capitalize(formatDate(fromDateKey(key), { weekday: 'long' }))
  return formatDate(fromDateKey(key), { day: 'numeric', month: 'short' })
}
