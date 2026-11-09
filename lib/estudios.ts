import { db } from '@/lib/firebaseClient'
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentReference,
} from 'firebase/firestore'

export const TIPOS_ESTUDIO = ['Grado', 'Máster', 'Doctorado', 'FP', 'Curso', 'Otro'] as const
export type TipoEstudio = (typeof TIPOS_ESTUDIO)[number]

export type Estudio = {
  id: string
  nombre: string
  tipo: TipoEstudio
  user_id: string
  por_defecto?: boolean
  created_at?: unknown
}

/** Colecciones cuyos documentos pertenecen a un estudio. */
export const COLECCIONES_POR_ESTUDIO = ['asignaturas', 'eventos', 'tareas', 'horario', 'notas_academicas'] as const

const LIMITE_BATCH = 450

const ejecutarEnLotes = async (
  refs: DocumentReference[],
  aplicar: (batch: ReturnType<typeof writeBatch>, ref: DocumentReference) => void
) => {
  for (let i = 0; i < refs.length; i += LIMITE_BATCH) {
    const batch = writeBatch(db)
    refs.slice(i, i + LIMITE_BATCH).forEach((ref) => aplicar(batch, ref))
    await batch.commit()
  }
}

export const cargarEstudios = async (uid: string): Promise<Estudio[]> => {
  const snapshot = await getDocs(query(collection(db, 'estudios'), where('user_id', '==', uid)))
  const estudios = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Estudio, 'id'>) }))
  // El estudio por defecto primero, el resto por nombre
  return estudios.sort((a, b) => Number(!!b.por_defecto) - Number(!!a.por_defecto) || a.nombre.localeCompare(b.nombre))
}

export const crearEstudio = async (
  uid: string,
  datos: { nombre: string; tipo: TipoEstudio; por_defecto?: boolean }
): Promise<Estudio> => {
  const payload = { ...datos, nombre: datos.nombre.trim(), user_id: uid }
  const ref = await addDoc(collection(db, 'estudios'), { ...payload, created_at: serverTimestamp() })
  return { id: ref.id, ...payload }
}

export const actualizarEstudio = async (id: string, datos: { nombre: string; tipo: TipoEstudio }) => {
  await updateDoc(doc(db, 'estudios', id), { nombre: datos.nombre.trim(), tipo: datos.tipo })
}

const inicializacionesEnCurso = new Map<string, Promise<Estudio[]>>()

/**
 * Carga los estudios del usuario. La primera vez (no tiene ninguno) crea el estudio por
 * defecto "Ingeniería" y le asigna todos los datos que ya tenía (sin estudio_id).
 * Si se llama varias veces a la vez (StrictMode, varios listeners) solo se ejecuta una vez.
 */
export const cargarOMigrarEstudios = (uid: string): Promise<Estudio[]> => {
  const enCurso = inicializacionesEnCurso.get(uid)
  if (enCurso) return enCurso
  const promesa = (async () => {
    const estudios = await cargarEstudios(uid)
    if (estudios.length > 0) return estudios
    await migrar(uid)
    return cargarEstudios(uid)
  })().finally(() => inicializacionesEnCurso.delete(uid))
  inicializacionesEnCurso.set(uid, promesa)
  return promesa
}

const migrar = async (uid: string): Promise<Estudio> => {
  const estudio = await crearEstudio(uid, { nombre: 'Ingeniería', tipo: 'Grado', por_defecto: true })

  for (const nombreColeccion of COLECCIONES_POR_ESTUDIO) {
    const snapshot = await getDocs(query(collection(db, nombreColeccion), where('user_id', '==', uid)))
    const sinEstudio = snapshot.docs.filter((d) => !d.data().estudio_id).map((d) => d.ref)
    await ejecutarEnLotes(sinEstudio, (batch, ref) => batch.update(ref, { estudio_id: estudio.id }))
  }

  return estudio
}

/** Borra un estudio y todo lo que cuelga de él (asignaturas, tareas, horario, notas y eventos). */
export const eliminarEstudioYDatos = async (uid: string, estudioId: string, esPorDefecto: boolean) => {
  const asignaturasSnapshot = await getDocs(query(collection(db, 'asignaturas'), where('user_id', '==', uid)))
  const perteneceAlEstudio = (data: { estudio_id?: string }) =>
    data.estudio_id === estudioId || (esPorDefecto && !data.estudio_id)

  const asignaturaIds = new Set(
    asignaturasSnapshot.docs.filter((d) => perteneceAlEstudio(d.data())).map((d) => d.id)
  )

  const refs: DocumentReference[] = []
  for (const nombreColeccion of COLECCIONES_POR_ESTUDIO) {
    const snapshot =
      nombreColeccion === 'asignaturas'
        ? asignaturasSnapshot
        : await getDocs(query(collection(db, nombreColeccion), where('user_id', '==', uid)))
    snapshot.docs.forEach((d) => {
      const data = d.data() as { estudio_id?: string; asignatura_id?: string }
      if (perteneceAlEstudio(data) || (data.asignatura_id && asignaturaIds.has(data.asignatura_id))) {
        refs.push(d.ref)
      }
    })
  }

  refs.push(doc(db, 'estudios', estudioId))
  await ejecutarEnLotes(refs, (batch, ref) => batch.delete(ref))
}
