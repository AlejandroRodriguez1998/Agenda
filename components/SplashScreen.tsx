import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons'

export default function SplashScreen() {
  return (
    <div className="app-splash">
      <div className="app-splash-inner">
        <div className="app-splash-logo">
          <FontAwesomeIcon icon={faGraduationCap} />
        </div>
        <div className="app-splash-title">Agenda Académica</div>
        <div className="app-splash-subtitle">Preparando tu panel</div>
        <div className="app-splash-progress" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  )
}
