import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'agenda-theme'

const THEME_COLORS: Record<Theme, string> = { light: '#f5f6fb', dark: '#0e1420' }

/**
 * Script inline para _document: aplica el tema guardado antes del primer pintado
 * y así evita el parpadeo claro→oscuro al abrir la app.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='dark'?'${THEME_COLORS.dark}':'${THEME_COLORS.light}')}catch(e){}})()`

export const applyTheme = (theme: Theme) => {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme])
}

export const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light'
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {}
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

type ThemeState = { theme: Theme; setTheme: (theme: Theme) => void }

const ThemeContext = createContext<ThemeState>({ theme: 'light', setTheme: () => {} })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')

  useEffect(() => {
    // themeInitScript ya aplicó el tema y el theme-color antes de pintar; aquí solo
    // sincronizamos el estado (y no pisamos el theme-color que pone el splash).
    const initial = getStoredTheme()
    setThemeState(initial)
    document.documentElement.dataset.theme = initial
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    applyTheme(next)
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {}
  }, [])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
