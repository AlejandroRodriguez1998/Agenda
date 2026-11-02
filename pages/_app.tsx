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
import { ThemeProvider } from '@/lib/theme'

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

  if (!ready || mustRedirect) return <SplashScreen />
  return <>{children}</>
}

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch((err) => console.warn('SW no registrado', err))
  }, [])

  return (
    <ThemeProvider>
      <Head>
        {/* viewport-fit=cover activa env(safe-area-inset-*) en iPhone; resizes-content hace que en Android el teclado redimensione la página */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content" />
      </Head>
      <AuthProvider>
        <DataProvider>
          <RouteGuard>
            <Component {...pageProps} />
          </RouteGuard>
          <Toaster
            position="top-center"
            containerStyle={{ top: 'max(12px, env(safe-area-inset-top))' }}
            toastOptions={{ className: 'app-toast', duration: 2800 }}
          />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
