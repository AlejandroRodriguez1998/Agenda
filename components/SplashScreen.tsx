import { useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons'

/** Color del borde superior del degradado (ver `--splash-top` en globals.css). */
const SPLASH_TOP = { light: '#2e2a85', dark: '#120f33' }

export default function SplashScreen() {
  // iOS pinta la barra de estado con theme-color: mientras se ve el splash
  // la igualamos al degradado para que no quede una franja de otro color.
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) return
    const previous = meta.getAttribute('content')
    const dark = document.documentElement.dataset.theme === 'dark'
    meta.setAttribute('content', dark ? SPLASH_TOP.dark : SPLASH_TOP.light)
    return () => {
      if (previous) meta.setAttribute('content', previous)
    }
  }, [])

  return (
    <div className="app-splash" role="status" aria-label="Cargando">
      <span className="app-splash__blob app-splash__blob--1" aria-hidden="true" />
      <span className="app-splash__blob app-splash__blob--2" aria-hidden="true" />
      <span className="app-splash__blob app-splash__blob--3" aria-hidden="true" />

      <div className="app-splash__content">
        <div className="app-splash__logo-wrap" aria-hidden="true">
          <span className="app-splash__glow" />
          <svg className="app-splash__ring" viewBox="0 0 140 140">
            <circle className="app-splash__ring-track" cx="70" cy="70" r="66" />
            <circle className="app-splash__ring-arc" cx="70" cy="70" r="66" pathLength="100" />
          </svg>
          <div className="app-splash__logo">
            <FontAwesomeIcon icon={faGraduationCap} />
          </div>
        </div>
        <div className="app-splash__title">Agenda</div>
        <div className="app-splash__subtitle">Preparando tu semana…</div>
        <div className="app-splash__progress" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  )
}
