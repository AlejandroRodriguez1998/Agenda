import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#1e1e1e" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"/>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
