import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faRightFromBracket } from '@fortawesome/free-solid-svg-icons'
import ModalUsuario from './ModalUsuario'

type TopNavProps = {
  title: string
  onAddClick?: () => void
  showAdd?: boolean
  customRightIcon?: 'plus' | 'logout'
  onRightClick?: () => void
}

export default function TopNav({
  title,
  onAddClick,
  showAdd = true,
  customRightIcon = 'plus',
  onRightClick,
}: TopNavProps) {
  const rightIcon =
    customRightIcon === 'logout' ? faRightFromBracket : faPlus

  return (
    <nav
      className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom"
      style={{ backgroundColor: '#1e1e1e', color: 'white' }}
    >
      <ModalUsuario />
      <h5 className="mb-0 text-center flex-grow-1">{title}</h5>
      {showAdd ? (
        <button
          className="btn btn-link text-white p-0"
          onClick={onRightClick || onAddClick}
        >
          <FontAwesomeIcon icon={rightIcon} size="lg" />
        </button>
      ) : (
        <span style={{ width: '1.5rem' }}></span>
      )}
    </nav>
  )
}
