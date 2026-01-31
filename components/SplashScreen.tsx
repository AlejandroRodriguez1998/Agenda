import Image from 'next/image'

export default function SplashScreen() {
  return (
    <div className="app-splash">
      <div className="app-splash-inner">
        <Image src="/icon-192x192.png" alt="Agenda Escolar" width={96} height={96} priority />
        <div className="app-splash-title">Agenda Escolar</div>
        <div className="app-splash-subtitle">Cargando...</div>
      </div>
    </div>
  )
}
