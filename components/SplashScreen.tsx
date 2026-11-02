import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons'

export default function SplashScreen() {
  return (
    <div className="app-splash" role="status" aria-label="Cargando">
      <span className="app-splash__blob app-splash__blob--1" aria-hidden="true" />
      <span className="app-splash__blob app-splash__blob--2" aria-hidden="true" />
      <span className="app-splash__blob app-splash__blob--3" aria-hidden="true" />

      <div className="app-splash__content">
        <div className="app-splash__logo-wrap" aria-hidden="true">
          <span className="app-splash__ring" />
          <span className="app-splash__pulse" />
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
