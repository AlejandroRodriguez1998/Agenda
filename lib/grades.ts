import type { Nota } from './types'

/** Nota acumulada: suma de nota × peso. Con el 100% evaluado es la nota final. */
export const calcularNotaFinal = (notas: Nota[]) =>
  notas.reduce((acc, n) => acc + (Number(n.nota) || 0) * ((Number(n.peso) || 0) / 100), 0)

export const pesoEvaluado = (notas: Nota[]) => notas.reduce((acc, n) => acc + (Number(n.peso) || 0), 0)

/** Media sobre lo ya evaluado (escala 0-10), útil cuando aún no se ha evaluado el 100%. */
export const mediaEvaluada = (notas: Nota[]) => {
  const peso = pesoEvaluado(notas)
  return peso > 0 ? calcularNotaFinal(notas) / (peso / 100) : 0
}

export const formatNota = (value: number) => value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** Clase CSS según el valor: suspenso, aprobado, notable/sobresaliente. */
export const gradeTone = (value: number) => (value < 5 ? 'grade--fail' : value < 7 ? 'grade--pass' : 'grade--good')
