import { Html, Head, Main, NextScript } from 'next/document'
import { sessionHintScript } from '@/lib/auth'
import { themeInitScript } from '@/lib/theme'

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <meta name="description" content="Organiza horarios, tareas, entregas y notas de tus asignaturas." />
        <meta name="theme-color" content="#f5f6fb" />
        <meta name="color-scheme" content="light dark" />
        {/* iOS no convierte números, fechas ni direcciones en enlaces */}
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Agenda" />
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: sessionHintScript }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
