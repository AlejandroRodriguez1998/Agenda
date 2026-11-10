import {
  faAngleLeft,
  faAngleRight,
  faBook,
  faCalendarDays,
  faChalkboardUser,
  faChartColumn,
  faClock,
  faGraduationCap,
  faHouse,
  faListCheck,
  faMoon,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import type React from "react";
import { AbsoluteFill } from "remotion";
import { Icon } from "../components/Icon";
import { fontFamily } from "../theme";

/**
 * Imagen de portfolio: el panel de inicio de Agenda Académica en escritorio,
 * replicado con los tokens y medidas de styles/globals.css (tema claro, ≥861px).
 * Mismo formato que el resto de imágenes del portfolio: 1672×941.
 */

const T = {
  bg: "#f5f6fb",
  surface: "#ffffff",
  soft: "#f0f2f8",
  muted2: "#f7f8fc",
  text: "#121826",
  muted: "#6b7489",
  border: "#e4e7ef",
  accent: "#5b54f0",
  accentSoft: "color-mix(in srgb, #5b54f0 12%, #ffffff)",
  danger: "#e5484d",
  dangerSoft: "color-mix(in srgb, #e5484d 12%, #ffffff)",
  warning: "#d97706",
  warningSoft: "color-mix(in srgb, #d97706 14%, #ffffff)",
  shadow: "0 1px 2px rgba(18,24,38,0.04), 0 8px 24px rgba(18,24,38,0.06)",
};

const C = {
  sd: "#6c63ff",
  redes: "#f43f5e",
  bd: "#10b981",
  ia: "#f59e0b",
  so: "#06b6d4",
  examen: "#a855f7",
  tutoria: "#0ea5e9",
};

const mix = (color: string, pct: number) =>
  `color-mix(in srgb, ${color} ${pct}%, #ffffff)`;

// ---------- Datos de ejemplo (semana del 12 al 18 de octubre de 2026) ----------

const FIRST_HOUR = 8;
const HOURS = 10; // 08:00 – 17:00
const HOUR_PX = 56;
const CLASS_DURATION = 1.5;
const TODAY = 2; // miércoles 14
const NOW = 13 + 20 / 60;

const DAYS = [
  ["Lun", 12],
  ["Mar", 13],
  ["Mié", 14],
  ["Jue", 15],
  ["Vie", 16],
  ["Sáb", 17],
  ["Dom", 18],
] as const;

type Clase = {
  day: number;
  hora: string;
  title: string;
  tipo: string;
  color: string;
};

const CLASES: Clase[] = [
  {
    day: 0,
    hora: "09:00",
    title: "Sistemas Distribuidos",
    tipo: "Teórica",
    color: C.sd,
  },
  {
    day: 0,
    hora: "11:30",
    title: "Bases de Datos",
    tipo: "Laboratorio",
    color: C.bd,
  },
  {
    day: 0,
    hora: "15:00",
    title: "Inteligencia Artificial",
    tipo: "Teórica",
    color: C.ia,
  },
  { day: 1, hora: "09:00", title: "Redes", tipo: "Teórica", color: C.redes },
  {
    day: 1,
    hora: "12:00",
    title: "Sistemas Operativos",
    tipo: "Laboratorio",
    color: C.so,
  },
  {
    day: 1,
    hora: "15:30",
    title: "Bases de Datos",
    tipo: "Teórica",
    color: C.bd,
  },
  {
    day: 2,
    hora: "09:00",
    title: "Sistemas Distribuidos",
    tipo: "Teórica",
    color: C.sd,
  },
  {
    day: 2,
    hora: "11:30",
    title: "Bases de Datos",
    tipo: "Laboratorio",
    color: C.bd,
  },
  {
    day: 2,
    hora: "15:30",
    title: "Inteligencia Artificial",
    tipo: "Teórica",
    color: C.ia,
  },
  {
    day: 3,
    hora: "10:00",
    title: "Redes",
    tipo: "Laboratorio",
    color: C.redes,
  },
  {
    day: 3,
    hora: "12:00",
    title: "Sistemas Operativos",
    tipo: "Teórica",
    color: C.so,
  },
  {
    day: 3,
    hora: "15:00",
    title: "Inteligencia Artificial",
    tipo: "Laboratorio",
    color: C.ia,
  },
  {
    day: 4,
    hora: "09:00",
    title: "Sistemas Distribuidos",
    tipo: "Laboratorio",
    color: C.sd,
  },
  { day: 4, hora: "11:30", title: "Redes", tipo: "Teórica", color: C.redes },
];

/** Entregas (tarea) y eventos de día completo. */
const ALLDAY: {
  day: number;
  title: string;
  color: string;
  kind: "tarea" | "evento";
}[] = [
  { day: 2, title: "Práctica 2: sockets", color: C.redes, kind: "tarea" },
  { day: 3, title: "Ejercicios de SQL", color: C.bd, kind: "tarea" },
  { day: 4, title: "Examen parcial IA", color: C.examen, kind: "evento" },
  { day: 6, title: "Leer paper RAFT", color: C.sd, kind: "tarea" },
];

const toHour = (hora: string) => {
  const [h, m] = hora.split(":").map(Number);
  return h + m / 60;
};

// ---------- Piezas ----------

const Card: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <section
    style={{
      padding: 16,
      border: `1px solid ${T.border}`,
      borderRadius: 20,
      background: T.surface,
      boxShadow: T.shadow,
      ...style,
    }}
  >
    {children}
  </section>
);

const CardHead: React.FC<{ title: string; aside: React.ReactNode }> = ({
  title,
  aside,
}) => (
  <div
    style={{
      marginBottom: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <h2
      style={{
        margin: 0,
        fontSize: 15,
        fontWeight: 750,
        letterSpacing: "-0.01em",
      }}
    >
      {title}
    </h2>
    {aside}
  </div>
);

const NAV = [
  { icon: faHouse, label: "Inicio" },
  { icon: faCalendarDays, label: "Horario" },
  { icon: faListCheck, label: "Tareas", count: 5 },
  { icon: faChartColumn, label: "Notas" },
  { icon: faBook, label: "Asignaturas" },
];

const Sidebar: React.FC = () => (
  <aside
    style={{
      width: 236,
      height: "100%",
      padding: "22px 14px",
      display: "flex",
      flexDirection: "column",
      gap: 22,
      borderRight: `1px solid ${T.border}`,
      background: T.surface,
    }}
  >
    <div
      style={{
        padding: "0 10px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: 16.5,
        fontWeight: 800,
      }}
    >
      <span
        style={{
          width: 36,
          height: 36,
          borderRadius: 11,
          display: "grid",
          placeItems: "center",
          background: T.accent,
        }}
      >
        <Icon icon={faGraduationCap} size={17} color="#fff" />
      </span>
      Agenda
    </div>
    <nav style={{ display: "grid", gap: 2 }}>
      {NAV.map((item, i) => {
        const active = i === 0;
        return (
          <div
            key={item.label}
            style={{
              minHeight: 42,
              padding: "0 12px",
              borderRadius: 11,
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 15,
              fontWeight: 600,
              background: active ? T.accentSoft : "transparent",
              color: active ? T.accent : T.muted,
            }}
          >
            <span style={{ width: 20, display: "grid", placeItems: "center" }}>
              <Icon icon={item.icon} size={16} />
            </span>
            {item.label}
            {item.count ? (
              <i
                style={{
                  marginLeft: "auto",
                  minWidth: 22,
                  padding: "1px 7px",
                  borderRadius: 999,
                  background: T.soft,
                  color: T.muted,
                  fontSize: 11,
                  fontStyle: "normal",
                  fontWeight: 750,
                  textAlign: "center",
                }}
              >
                {item.count}
              </i>
            ) : null}
          </div>
        );
      })}
    </nav>
    <div
      style={{
        marginTop: "auto",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span
        style={{
          width: 40,
          height: 40,
          display: "grid",
          placeItems: "center",
          color: T.muted,
        }}
      >
        <Icon icon={faMoon} size={16} />
      </span>
      <span
        style={{
          flex: 1,
          minWidth: 0,
          padding: 6,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background: T.accentSoft,
            color: T.accent,
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          AP
        </span>
        <span
          style={{
            color: T.muted,
            fontSize: 12,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          alex@correo.com
        </span>
      </span>
    </div>
  </aside>
);

const Stat: React.FC<{
  icon: Parameters<typeof Icon>[0]["icon"];
  value: string;
  label: string;
  alert?: boolean;
}> = ({ icon, value, label, alert }) => (
  <div
    style={{
      padding: 16,
      border: `1px solid ${T.border}`,
      borderRadius: 14,
      background: T.surface,
      boxShadow: T.shadow,
      display: "flex",
      alignItems: "center",
      gap: 14,
    }}
  >
    <span
      style={{
        width: 42,
        height: 42,
        borderRadius: 12,
        display: "grid",
        placeItems: "center",
        background: alert ? T.dangerSoft : T.accentSoft,
        color: alert ? T.danger : T.accent,
      }}
    >
      <Icon icon={icon} size={16} />
    </span>
    <span style={{ display: "grid", gap: 2 }}>
      <strong
        style={{
          fontSize: 22,
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </strong>
      <span style={{ color: T.muted, fontSize: 12.5 }}>{label}</span>
    </span>
  </div>
);

const Calendar: React.FC = () => (
  <Card style={{ flex: 1, minWidth: 0 }}>
    <div
      style={{
        marginBottom: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <span
          style={{
            width: 40,
            height: 40,
            display: "grid",
            placeItems: "center",
            color: T.muted,
          }}
        >
          <Icon icon={faAngleLeft} size={16} />
        </span>
        <h2
          style={{
            margin: 0,
            padding: "0 4px",
            fontSize: 16.5,
            fontWeight: 750,
          }}
        >
          12 oct – 18 oct 2026
        </h2>
        <span
          style={{
            width: 40,
            height: 40,
            display: "grid",
            placeItems: "center",
            color: T.muted,
          }}
        >
          <Icon icon={faAngleRight} size={16} />
        </span>
      </div>
      <div
        style={{
          padding: 3,
          borderRadius: 12,
          display: "inline-flex",
          gap: 2,
          background: T.soft,
        }}
      >
        {["Día", "Semana", "Mes"].map((v) => {
          const active = v === "Semana";
          return (
            <span
              key={v}
              style={{
                minHeight: 34,
                padding: "0 14px",
                borderRadius: 9,
                display: "inline-flex",
                alignItems: "center",
                fontSize: 13,
                fontWeight: 650,
                background: active ? T.surface : "transparent",
                color: active ? T.text : T.muted,
                boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {v}
            </span>
          );
        })}
      </div>
    </div>

    <div
      style={{
        overflow: "hidden",
        border: `1px solid ${T.border}`,
        borderRadius: 14,
      }}
    >
      {/* Cabecera de días */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "52px repeat(7, minmax(0, 1fr))",
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <span />
        {DAYS.map(([name, n], i) => (
          <div
            key={n}
            style={{
              padding: "8px 0",
              borderLeft: `1px solid ${T.border}`,
              display: "grid",
              justifyItems: "center",
              gap: 2,
            }}
          >
            <span
              style={{
                color: T.muted,
                fontSize: 11,
                fontWeight: 650,
                textTransform: "uppercase",
              }}
            >
              {name}
            </span>
            <strong
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                fontSize: 15,
                fontWeight: 750,
                background: i === TODAY ? T.accent : "transparent",
                color: i === TODAY ? "#fff" : T.text,
              }}
            >
              {n}
            </strong>
          </div>
        ))}
      </div>

      {/* Fila de día completo: entregas y eventos */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "52px repeat(7, minmax(0, 1fr))",
          minHeight: 34,
          borderBottom: `1px solid ${T.border}`,
          background: T.muted2,
        }}
      >
        <span
          style={{
            padding: "8px 6px",
            color: T.muted,
            fontSize: 10,
            fontWeight: 650,
            textAlign: "right",
          }}
        >
          Día
        </span>
        {DAYS.map(([, n], i) => (
          <div
            key={n}
            style={{
              minWidth: 0,
              padding: 4,
              display: "grid",
              alignContent: "start",
              gap: 3,
              borderLeft: `1px solid ${T.border}`,
            }}
          >
            {ALLDAY.filter((a) => a.day === i).map((a) => (
              <span
                key={a.title}
                style={{
                  minWidth: 0,
                  padding: "3px 8px",
                  borderRadius: 7,
                  fontSize: 11,
                  fontWeight: 650,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  ...(a.kind === "evento"
                    ? { background: a.color, color: "#fff" }
                    : {
                        background: mix(a.color, 16),
                        color: T.text,
                        borderLeft: `3px solid ${a.color}`,
                      }),
                }}
              >
                {a.title}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* Rejilla horaria */}
      <div
        style={{
          position: "relative",
          height: HOURS * HOUR_PX,
          display: "grid",
          gridTemplateColumns: "52px repeat(7, minmax(0, 1fr))",
          backgroundImage: `linear-gradient(to bottom, ${T.border} 1px, transparent 1px)`,
          backgroundSize: `100% ${HOUR_PX}px`,
        }}
      >
        <div style={{ display: "grid", gridAutoRows: HOUR_PX }}>
          {Array.from({ length: HOURS }, (_, i) => (
            <span
              key={i}
              style={{
                padding: "4px 8px 0 0",
                color: T.muted,
                fontSize: 10.5,
                textAlign: "right",
              }}
            >
              {String(FIRST_HOUR + i).padStart(2, "0")}:00
            </span>
          ))}
        </div>
        {DAYS.map(([, n], i) => (
          <div
            key={n}
            style={{
              position: "relative",
              borderLeft: `1px solid ${T.border}`,
              background:
                i === TODAY
                  ? "color-mix(in srgb, #5b54f0 4%, transparent)"
                  : "transparent",
            }}
          >
            {CLASES.filter((c) => c.day === i).map((c) => (
              <div
                key={c.hora}
                style={{
                  position: "absolute",
                  top: (toHour(c.hora) - FIRST_HOUR) * HOUR_PX + 2,
                  height: CLASS_DURATION * HOUR_PX - 4,
                  left: 2,
                  right: 2,
                  padding: "6px 8px",
                  borderLeft: `3px solid ${c.color}`,
                  borderRadius: 8,
                  display: "grid",
                  alignContent: "start",
                  gap: 1,
                  overflow: "hidden",
                  background: mix(c.color, 15),
                }}
              >
                <strong
                  style={{ fontSize: 11.5, fontWeight: 700, lineHeight: 1.2 }}
                >
                  {c.title}
                </strong>
                <span
                  style={{
                    color: T.muted,
                    fontSize: 10.5,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {c.hora} · {c.tipo}
                </span>
              </div>
            ))}
            {i === TODAY ? (
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: (NOW - FIRST_HOUR) * HOUR_PX,
                  height: 2,
                  background: T.danger,
                  zIndex: 3,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: -5,
                    top: -4,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: T.danger,
                  }}
                />
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  </Card>
);

const HOY = [
  {
    time: "Entrega",
    title: "Práctica 2: sockets",
    sub: "Entrega · Redes",
    color: C.redes,
    check: true,
  },
  {
    time: "09:00",
    title: "Sistemas Distribuidos",
    sub: "Teórica",
    color: C.sd,
  },
  { time: "11:30", title: "Bases de Datos", sub: "Laboratorio", color: C.bd },
  {
    time: "15:30",
    title: "Inteligencia Artificial",
    sub: "Teórica",
    color: C.ia,
  },
];

const Hoy: React.FC = () => (
  <Card>
    <CardHead
      title="Hoy"
      aside={
        <span style={{ color: T.muted, fontSize: 12.5 }}>4 elementos</span>
      }
    />
    <div style={{ display: "grid", gap: 8 }}>
      {HOY.map((item) => (
        <div
          key={item.title}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <div
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: 52,
              padding: "8px 12px",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: mix(item.color, 10),
              position: "relative",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 8,
                bottom: 8,
                left: 0,
                width: 4,
                borderRadius: "0 4px 4px 0",
                background: item.color,
              }}
            />
            <span
              style={{
                width: 62,
                color: T.muted,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {item.time}
            </span>
            <span style={{ minWidth: 0, display: "grid" }}>
              <strong
                style={{
                  fontSize: 14,
                  fontWeight: 650,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {item.title}
              </strong>
              <small style={{ color: T.muted, fontSize: 12 }}>{item.sub}</small>
            </span>
          </div>
          {item.check ? (
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                border: `2px solid ${item.color}`,
              }}
            />
          ) : null}
        </div>
      ))}
    </div>
  </Card>
);

const PENDIENTES = [
  {
    title: "Resumen tema 3",
    sub: "Inteligencia Artificial",
    color: C.ia,
    due: "Hace 2 días",
    tone: "late",
  },
  {
    title: "Práctica 2: sockets",
    sub: "Redes",
    color: C.redes,
    due: "Hoy",
    tone: "soon",
  },
  {
    title: "Leer paper RAFT",
    sub: "Sistemas Distribuidos",
    color: C.sd,
    due: "Domingo",
    tone: "normal",
  },
] as const;

const Pendientes: React.FC = () => (
  <Card>
    <CardHead
      title="Pendientes"
      aside={
        <span style={{ color: T.accent, fontSize: 12.5, fontWeight: 600 }}>
          Ver todas
        </span>
      }
    />
    <div style={{ display: "grid" }}>
      {PENDIENTES.map((t, i) => (
        <div
          key={t.title}
          style={{
            minHeight: 52,
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderTop: i ? `1px solid ${T.border}` : "none",
          }}
        >
          <span
            style={{
              width: 26,
              height: 26,
              flex: "none",
              borderRadius: "50%",
              border: `2px solid color-mix(in srgb, ${t.color} 70%, ${T.border})`,
            }}
          />
          <span
            style={{
              flex: 1,
              minWidth: 0,
              padding: "7px 0",
              display: "grid",
              gap: 1,
            }}
          >
            <strong style={{ fontSize: 14, fontWeight: 600 }}>{t.title}</strong>
            <small
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: T.muted,
                fontSize: 12,
              }}
            >
              <i
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: t.color,
                }}
              />
              {t.sub}
            </small>
          </span>
          <span
            style={{
              padding: "3px 9px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              whiteSpace: "nowrap",
              ...(t.tone === "late"
                ? { background: T.dangerSoft, color: T.danger }
                : t.tone === "soon"
                  ? { background: T.warningSoft, color: T.warning }
                  : { background: T.soft, color: T.muted }),
            }}
          >
            {t.due}
          </span>
        </div>
      ))}
    </div>
  </Card>
);

const EVENTOS = [
  {
    month: "oct",
    day: 16,
    title: "Examen parcial IA",
    when: "Viernes",
    color: C.examen,
  },
  {
    month: "oct",
    day: 21,
    title: "Tutoría TFG",
    when: "21 oct",
    color: C.tutoria,
  },
];

const Proximos: React.FC = () => (
  <Card>
    <CardHead title="Próximos eventos" aside={null} />
    <div style={{ display: "grid", gap: 4 }}>
      {EVENTOS.map((e) => (
        <div
          key={e.title}
          style={{ padding: 4, display: "flex", alignItems: "center", gap: 12 }}
        >
          <span
            style={{
              width: 44,
              height: 46,
              borderRadius: 12,
              display: "grid",
              placeContent: "center",
              background: mix(e.color, 14),
              color: e.color,
              textAlign: "center",
              lineHeight: 1.05,
            }}
          >
            <small
              style={{
                fontSize: 9.5,
                fontWeight: 750,
                textTransform: "uppercase",
              }}
            >
              {e.month}
            </small>
            <strong style={{ fontSize: 16.5, fontWeight: 800 }}>{e.day}</strong>
          </span>
          <span style={{ display: "grid" }}>
            <strong style={{ fontSize: 14, fontWeight: 650 }}>{e.title}</strong>
            <small style={{ color: T.muted, fontSize: 12 }}>{e.when}</small>
          </span>
        </div>
      ))}
    </div>
  </Card>
);

export const PortfolioCover: React.FC = () => (
  <AbsoluteFill
    style={{
      background: T.bg,
      color: T.text,
      fontFamily,
      flexDirection: "row",
    }}
  >
    <Sidebar />
    <div style={{ flex: 1, minWidth: 0 }}>
      <header
        style={{
          padding: "26px 28px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <span
            style={{
              display: "block",
              color: T.muted,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Miércoles, 14 de octubre
          </span>
          <h1
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Buenas tardes, Alejandro
          </h1>
        </div>
        <span
          style={{
            minHeight: 44,
            padding: "0 18px",
            borderRadius: 14,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: T.accent,
            color: "#fff",
            fontSize: 15,
            fontWeight: 650,
          }}
        >
          <Icon icon={faPlus} size={14} /> Nuevo
        </span>
      </header>

      <main
        style={{
          padding: "0 28px",
          display: "grid",
          gap: 16,
          gridTemplateColumns: "minmax(0, 1fr) 340px",
          alignItems: "start",
        }}
      >
        <div
          style={{
            gridColumn: "1 / -1",
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 14,
          }}
        >
          <Stat icon={faChalkboardUser} value="3" label="clases hoy" />
          <Stat icon={faClock} value="3" label="entregas en 7 días" />
          <Stat
            icon={faListCheck}
            value="5"
            label="pendientes · 1 atrasada"
            alert
          />
        </div>
        <Calendar />
        <aside style={{ display: "grid", gap: 16 }}>
          <Hoy />
          <Pendientes />
          <Proximos />
        </aside>
      </main>
    </div>
  </AbsoluteFill>
);
