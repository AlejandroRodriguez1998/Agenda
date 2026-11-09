import Head from 'next/head'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCompass } from '@fortawesome/free-solid-svg-icons'

export default function NotFound() {
  return (
    <>
      <Head>
        <title>Página no encontrada · Agenda</title>
      </Head>
      <main className="center-screen">
        <div className="status-card">
          <span className="status-card__icon"><FontAwesomeIcon icon={faCompass} /></span>
          <h1>Página no encontrada</h1>
          <p>La dirección no existe o se ha movido.</p>
          <Link href="/" className="btn btn--primary btn--block">Volver al inicio</Link>
        </div>
      </main>
    </>
  )
}
