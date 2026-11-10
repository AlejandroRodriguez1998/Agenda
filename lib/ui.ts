import Swal from 'sweetalert2'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'

/** Diálogo de confirmación con el estilo de la app (ver `.app-swal` en globals.css). */
export const confirmar = async ({
  title,
  text,
  confirmText = 'Eliminar',
  danger = true,
}: {
  title: string
  text?: string
  confirmText?: string
  danger?: boolean
}) => {
  const result = await Swal.fire({
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    buttonsStyling: false,
    focusCancel: danger,
    customClass: {
      popup: 'app-swal',
      confirmButton: danger ? 'btn btn--danger' : 'btn btn--primary',
      cancelButton: 'btn btn--ghost',
      actions: 'app-swal__actions',
    },
  })
  return result.isConfirmed
}

export const errorMessage = (err: unknown, fallback: string) => {
  const code = (err as { code?: string })?.code
  if (code === 'permission-denied') return 'No tienes permiso para hacer esto'
  if (code === 'unavailable') return 'Sin conexión. Se guardará al reconectar'
  return fallback
}

export const notifyError = (err: unknown, fallback: string) => {
  console.error(err)
  toast.error(errorMessage(err, fallback))
}

export const useMediaQuery = (queryText: string) => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(queryText)
    const update = () => setMatches(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [queryText])

  return matches
}

export const MOBILE_QUERY = '(max-width: 860px)'

/**
 * Safari ignora `user-scalable=no`: bloqueamos a mano el pellizco (gesture*)
 * y el zoom con dos dedos para que la PWA se comporte como una app nativa.
 * El doble toque ya lo evita `touch-action: manipulation` en globals.css.
 */
export const bloquearZoom = () => {
  const prevenir = (event: Event) => event.preventDefault()
  const pellizco = (event: TouchEvent) => {
    if (event.touches.length > 1) event.preventDefault()
  }
  document.addEventListener('gesturestart', prevenir)
  document.addEventListener('gesturechange', prevenir)
  document.addEventListener('touchmove', pellizco, { passive: false })
  return () => {
    document.removeEventListener('gesturestart', prevenir)
    document.removeEventListener('gesturechange', prevenir)
    document.removeEventListener('touchmove', pellizco)
  }
}
