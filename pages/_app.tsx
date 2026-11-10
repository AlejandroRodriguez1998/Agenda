import '@fortawesome/fontawesome-svg-core/styles.css'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, type ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'
import { config } from '@fortawesome/fontawesome-svg-core'
import SplashScreen from '@/components/SplashScreen'
import { AuthProvider, useAuth } from '@/lib/auth'
import { DataProvider } from '@/lib/data'
import { EstudioProvider, useEstudio } from '@/components/EstudioContext'
import { ThemeProvider } from '@/lib/theme'
import { bloquearZoom } from '@/lib/ui'

// Los estilos de FontAwesome se importan arriba; evita que los inyecte en runtime (parpadeo de iconos).
config.autoAddCss = false

/** Rutas accesibles sin sesión. `/` muestra la landing o el panel según haya sesión. */
const PUBLIC_ROUTES = new Set(['/', '/login', '/verificar', '/logout', '/404', '/_error'])

function RouteGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, ready } = useAuth()
  const isPublic = PUBLIC_ROUTES.has(router.pathname)
  const mustRedirect = ready && !user && !isPublic

  useEffect(() => {
    if (mustRedirect) {
      router.replace({ pathname: '/login', query: { next: router.asPath } })
    }
  }, [mustRedirect, router])

  if (mustRedirect || (!ready && !isPublic)) return <SplashScreen />
  // En `/` la landing se pinta ya; el splash solo se ve encima si había sesión
  // (html[data-session]), mientras Firebase confirma el usuario y carga el panel.
  if (!ready && router.pathname === '/') {
    return (
      <>
        {children}
        <SplashScreen soloConSesion />
      </>
    )
  }
  return <>{children}</>
}

function StudyPage({ Component, pageProps }: Pick<AppProps, 'Component' | 'pageProps'>) {
  const { estudioId } = useEstudio()
  return <Component key={estudioId} {...pageProps} />
}

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => bloquearZoom(), [])

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch((err) => console.warn('SW no registrado', err))
  }, [])

  return (
    <ThemeProvider>
      <Head>
        {/* Sin zoom (como una app nativa); viewport-fit=cover activa env(safe-area-inset-*) en iPhone; resizes-content hace que en Android el teclado redimensione la página */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content" />
      </Head>
      <AuthProvider>
        <EstudioProvider>
          <DataProvider>
            <RouteGuard>
              <StudyPage Component={Component} pageProps={pageProps} />
            </RouteGuard>
            <Toaster
              position="top-center"
              containerStyle={{ top: 'max(12px, env(safe-area-inset-top))' }}
              toastOptions={{ className: 'app-toast', duration: 2800 }}
            />
          </DataProvider>
        </EstudioProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
