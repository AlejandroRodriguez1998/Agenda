import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons'

export default function SplashScreen() {
  return (
    <div className="app-splash" role="status" aria-label="Cargando">
      <div className="app-splash__logo">
        <FontAwesomeIcon icon={faGraduationCap} />
      </div>
      <div className="app-splash__progress" aria-hidden="true">
        <span />
      </div>
    </div>
  )
}
