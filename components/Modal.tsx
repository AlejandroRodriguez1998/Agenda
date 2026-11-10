import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

type ModalProps = {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  /** Si se pasa, el contenido se envuelve en un <form> (Enter envía). */
  onSubmit?: () => void | Promise<void>
  footer?: ReactNode
  accent?: string
}

/** Hoja inferior en móvil, diálogo centrado en escritorio. */
export default function Modal({ open, title, subtitle, onClose, children, onSubmit, footer, accent }: ModalProps) {
  const titleId = useId()
  const [mounted, setMounted] = useState(false)
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  // Bloquea el fondo mientras el modal está abierto. En iOS `overflow: hidden`
  // no basta: fijamos el body en su posición actual y la restauramos al cerrar.
  useEffect(() => {
    if (!open) return
    const scrollY = window.scrollY
    const body = document.body.style
    const previo = { position: body.position, top: body.top, left: body.left, right: body.right, overflow: body.overflow }
    Object.assign(body, { position: 'fixed', top: `-${scrollY}px`, left: '0', right: '0', overflow: 'hidden' })

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      Object.assign(body, previo)
      window.scrollTo(0, scrollY)
    }
  }, [open])

  // Teclado en iOS: no redimensiona la página y además desplaza la vista para
  // enseñar el campo enfocado. Anulamos ese desplazamiento (la app de fondo no se
  // mueve), ajustamos la capa al área visible para que la hoja quede encima del
  // teclado y llevamos el campo a la vista desplazando solo el interior de la hoja.
  useEffect(() => {
    const viewport = window.visualViewport
    if (!open || !mounted || !viewport) return

    let frame = 0

    const update = () => {
      if (window.scrollY !== 0 || viewport.offsetTop !== 0) window.scrollTo(0, 0)
      const layer = layerRef.current
      if (!layer) return
      layer.style.top = `${viewport.offsetTop}px`
      layer.style.height = `${viewport.height}px`
      layer.classList.toggle('has-keyboard', window.innerHeight - viewport.height > 120)
    }

    const mostrarCampo = () => {
      const campo = document.activeElement as HTMLElement | null
      const contenedor = campo?.closest<HTMLElement>('.sheet__body')
      if (!campo || !contenedor || !campo.matches('input, select, textarea')) return
      const margen = 12
      const caja = contenedor.getBoundingClientRect()
      const rect = campo.getBoundingClientRect()
      if (rect.bottom > caja.bottom - margen) contenedor.scrollTop += rect.bottom - caja.bottom + margen
      else if (rect.top < caja.top + margen) contenedor.scrollTop -= caja.top + margen - rect.top
    }

    // Mientras el teclado se anima, corregimos cada fotograma para que no se vea el salto.
    const seguirTeclado = () => {
      cancelAnimationFrame(frame)
      const fin = performance.now() + 700
      const tick = () => {
        update()
        if (performance.now() < fin) frame = requestAnimationFrame(tick)
        else mostrarCampo()
      }
      frame = requestAnimationFrame(tick)
    }

    const onFocusIn = (event: FocusEvent) => {
      if ((event.target as HTMLElement).matches('input, select, textarea')) seguirTeclado()
    }
    const onResize = () => {
      update()
      mostrarCampo()
    }

    update()
    viewport.addEventListener('resize', onResize)
    viewport.addEventListener('scroll', update)
    document.addEventListener('focusin', onFocusIn)
    return () => {
      cancelAnimationFrame(frame)
      viewport.removeEventListener('resize', onResize)
      viewport.removeEventListener('scroll', update)
      document.removeEventListener('focusin', onFocusIn)
    }
  }, [open, mounted])

  if (!open || !mounted) return null

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    await onSubmit?.()
  }

  const body = (
    <>
      <header className="sheet__header">
        <div>
          <h2 id={titleId}>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar">
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </header>
      <div className="sheet__body">{children}</div>
      {footer && <footer className="sheet__footer">{footer}</footer>}
    </>
  )

  return createPortal(
    <div ref={layerRef} className="sheet-layer" onMouseDown={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={accent ? ({ '--accent-item': accent } as React.CSSProperties) : undefined}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span className="sheet__grip" aria-hidden="true" />
        {onSubmit ? <form onSubmit={handleSubmit}>{body}</form> : body}
      </div>
    </div>,
    document.body
  )
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
      {hint && <small className="field__hint">{hint}</small>}
    </label>
  )
}

export function ColorPicker({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  const swatches = ['#6c63ff', '#3b82f6', '#06b6d4', '#10b981', '#84cc16', '#f59e0b', '#f97316', '#f43f5e', '#ec4899', '#a855f7']
  const isCustom = !swatches.includes(value.toLowerCase())

  return (
    <div className="swatches" role="radiogroup" aria-label="Color">
      {swatches.map((color) => (
        <button
          key={color}
          type="button"
          role="radio"
          aria-checked={value.toLowerCase() === color}
          aria-label={color}
          className="swatch"
          style={{ background: color }}
          onClick={() => onChange(color)}
        />
      ))}
      <label className={`swatch swatch--custom ${isCustom ? 'is-checked' : ''}`} style={isCustom ? { background: value } : undefined} title="Otro color">
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} aria-label="Color personalizado" />
      </label>
    </div>
  )
}
