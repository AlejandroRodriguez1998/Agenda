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

  // En iOS el teclado no redimensiona la página: ajustamos la capa al área
  // realmente visible (visualViewport) para que la hoja quede encima del teclado.
  useEffect(() => {
    const viewport = window.visualViewport
    if (!open || !mounted || !viewport) return

    const update = () => {
      const layer = layerRef.current
      if (!layer) return
      layer.style.top = `${viewport.offsetTop}px`
      layer.style.height = `${viewport.height}px`
      layer.classList.toggle('has-keyboard', window.innerHeight - viewport.height > 120)
    }
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement
      if (!target.matches('input, select, textarea')) return
      // Espera a que el teclado termine de aparecer antes de centrar el campo.
      window.setTimeout(() => target.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 300)
    }

    update()
    viewport.addEventListener('resize', update)
    viewport.addEventListener('scroll', update)
    document.addEventListener('focusin', onFocusIn)
    return () => {
      viewport.removeEventListener('resize', update)
      viewport.removeEventListener('scroll', update)
      document.removeEventListener('focusin', onFocusIn)
    }
  }, [open, mounted])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

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
