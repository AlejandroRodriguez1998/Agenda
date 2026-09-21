export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'agenda-theme'

export const applyTheme = (theme: Theme) => {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = theme
}

export const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const setStoredTheme = (theme: Theme) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  applyTheme(theme)
}
