import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarDays, faFlask, faChalkboardUser } from '@fortawesome/free-solid-svg-icons'
import AppShell, { EmptyState, Skeleton } from '@/components/AppShell'
import ModalHorario from '@/components/ModalHorario'
import { useAuth } from '@/lib/auth'
import { useData } from '@/lib/data'
import { capitalize, nombreDia } from '@/lib/dates'
import { COLOR_POR_DEFECTO, DIAS_SEMANA, type Horario } from '@/lib/types'
import { MOBILE_QUERY, useMediaQuery } from '@/lib/ui'

export default function HorariosPage() {
  const { user } = useAuth()
  const { horarios, asignaturasMap, cargando } = useData()
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const [dia, setDia] = useState<string>(() => nombreDia(new Date()))
  const [modal, setModal] = useState<{ open: boolean; horario: Horario | null }>({ open: false, horario: null })

  const hoy = nombreDia(new Date())
  const porDia = Object.fromEntries(DIAS_SEMANA.map((d) => [d, horarios.filter((h) => h.dias?.includes(d))])) as Record<string, Horario[]>
  // El fin de semana solo aparece en escritorio si hay clases.
  const diasVisibles = DIAS_SEMANA.filter((d) => isMobile || !['sábado', 'domingo'].includes(d) || porDia[d].length)

  const renderClase = (horario: Horario) => {
    const asignatura = asignaturasMap.get(horario.asignatura_id)
    const lab = horario.tipo === 'laboratorio'
    return (
      <button
        key={horario.id}
        type="button"
        className="class-card"
        style={{ '--item': asignatura?.color || COLOR_POR_DEFECTO } as React.CSSProperties}
        onClick={() => setModal({ open: true, horario })}
      >
        <time>{horario.hora}</time>
        <span className="class-card__body">
          <strong>{asignatura?.nombre || 'Asignatura eliminada'}</strong>
          <small>
            <FontAwesomeIcon icon={lab ? faFlask : faChalkboardUser} /> {capitalize(horario.tipo || 'clase')}
          </small>
        </span>
      </button>
    )
  }

  return (
    <AppShell title="Horario" subtitle={`${horarios.length} clases semanales`} onAdd={() => setModal({ open: true, horario: null })} addLabel="Nueva clase">
      {cargando ? (
        <Skeleton />
      ) : !horarios.length ? (
        <EmptyState
          icon={faCalendarDays}
          title="Tu horario está vacío"
          text="Añade tus clases semanales y aparecerán automáticamente en el calendario."
          action={<button type="button" className="btn btn--primary" onClick={() => setModal({ open: true, horario: null })}>Añadir clase</button>}
        />
      ) : isMobile ? (
        <>
          <div className="day-tabs" role="tablist" aria-label="Día de la semana">
            {DIAS_SEMANA.map((d) => (
              <button key={d} type="button" role="tab" aria-selected={dia === d} className={`${dia === d ? 'is-active' : ''} ${d === hoy ? 'is-today' : ''}`} onClick={() => setDia(d)}>
                <span>{d === 'miércoles' ? 'X' : d.charAt(0).toUpperCase()}</span>
                {porDia[d].length > 0 && <i>{porDia[d].length}</i>}
              </button>
            ))}
          </div>
          <section className="card">
            <div className="card__head">
              <h2>{capitalize(dia)}{dia === hoy && <span className="tag">Hoy</span>}</h2>
              <span className="muted">{porDia[dia].length} clase{porDia[dia].length === 1 ? '' : 's'}</span>
            </div>
            {porDia[dia].length ? <div className="class-list">{porDia[dia].map(renderClase)}</div> : <p className="muted pad">Sin clases este día.</p>}
          </section>
        </>
      ) : (
        <div className="week-board" style={{ '--cols': diasVisibles.length } as React.CSSProperties}>
          {diasVisibles.map((d) => (
            <section key={d} className={`week-board__col ${d === hoy ? 'is-today' : ''}`}>
              <h2>{capitalize(d)}{d === hoy && <span className="tag">Hoy</span>}</h2>
              {porDia[d].length ? porDia[d].map(renderClase) : <p className="muted">Libre</p>}
            </section>
          ))}
        </div>
      )}

      {user && (
        <ModalHorario
          open={modal.open}
          horario={modal.horario}
          diaPorDefecto={isMobile ? dia : undefined}
          userId={user.uid}
          onClose={() => setModal((s) => ({ ...s, open: false }))}
        />
      )}
    </AppShell>
  )
}
