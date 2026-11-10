import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { auth } from './firebaseClient'

type AuthState = {
  user: User | null
  ready: boolean
}

const AuthContext = createContext<AuthState>({ user: null, ready: false })

/** Único listener de sesión para toda la app. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, ready: false })

  useEffect(
    () =>
      onAuthStateChanged(auth, (user) => {
        recordarSesion(!!user)
        setState({ user, ready: true })
      }),
    []
  )

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

/**
 * Pista de sesión: si el usuario tenía la sesión iniciada, `<html data-session="1">`
 * se marca antes del primer pintado (ver sessionHintScript en _document). Así el splash
 * solo aparece cuando hay sesión y, sin ella, la landing se ve al instante.
 */
const SESSION_HINT_KEY = 'agenda-session'

export const sessionHintScript = `(function(){try{if(localStorage.getItem('${SESSION_HINT_KEY}')==='1')document.documentElement.dataset.session='1'}catch(e){}})()`

const recordarSesion = (activa: boolean) => {
  try {
    if (activa) localStorage.setItem(SESSION_HINT_KEY, '1')
    else localStorage.removeItem(SESSION_HINT_KEY)
  } catch {}
  if (activa) document.documentElement.dataset.session = '1'
  else delete document.documentElement.dataset.session
}

export const LOGOUT_FLAG = 'showLogoutToast'

export const cerrarSesion = async () => {
  await signOut(auth)
  try {
    localStorage.setItem(LOGOUT_FLAG, 'true')
  } catch {}
}

/** Solo acepta rutas internas como destino tras el login (evita redirecciones abiertas). */
export const safeNext = (value: unknown) =>
  typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/'

/** Apodos por usuario (parte del correo antes de la @, en minúsculas). */
const APODOS: Record<string, string> = {
  alexcr31: 'Alec',
}

/** Nombre con el que la app se dirige al usuario. */
export const nombreVisible = (user: Pick<User, 'displayName' | 'email'> | null) => {
  const usuario = user?.email?.split('@')[0] ?? ''
  return APODOS[usuario.toLowerCase()] || user?.displayName?.split(' ')[0] || usuario
}
