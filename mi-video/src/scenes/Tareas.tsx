import { faCheck } from "@fortawesome/free-solid-svg-icons";
import type React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Icon } from "../components/Icon";
import { Card, Phone, ScreenHeader } from "../components/Phone";
import {
  DarkBackground,
  FloatCard,
  GradientText,
  SceneCopy,
  useEnter,
} from "../components/ui";
import { APP, SUBJECT } from "../theme";

const PHONE_DELAY = 6;
/** Frame en el que se completa la tarea «Práctica 2». */
const TAP = 66;

type Task = {
  title: string;
  subject: string;
  color: string;
  due: string;
  tone: "late" | "soon" | "normal";
  animated?: boolean;
};

const GROUPS: { name: string; tasks: Task[] }[] = [
  {
    name: "Atrasadas",
    tasks: [{ title: "Resumen tema 3", subject: "Inteligencia Artificial", color: SUBJECT.ia, due: "Ayer", tone: "late" }],
  },
  {
    name: "Hoy",
    tasks: [
      { title: "Práctica 2: sockets", subject: "Redes", color: SUBJECT.redes, due: "Hoy", tone: "soon", animated: true },
      { title: "Ejercicios de SQL", subject: "Bases de Datos", color: SUBJECT.bd, due: "Hoy", tone: "soon" },
    ],
  },
  {
    name: "Esta semana",
    tasks: [
      { title: "Informe de laboratorio", subject: "Sistemas Distribuidos", color: SUBJECT.distribuidos, due: "Vie", tone: "normal" },
      { title: "Leer paper RAFT", subject: "Sistemas Distribuidos", color: SUBJECT.distribuidos, due: "Dom", tone: "normal" },
    ],
  },
];

const DUE_STYLE = {
  late: { color: APP.danger, background: "#fdecec" },
  soon: { color: APP.warning, background: "#fdf3e1" },
  normal: { color: APP.muted, background: APP.soft },
};

const TaskRow: React.FC<{ task: Task }> = ({ task }) => {
  const frame = useCurrentFrame();
  const enter = useEnter(TAP, 14);
  const done = task.animated ? enter : 0;
  const ripple = interpolate(frame, [TAP - 4, TAP + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0" }}>
      <div style={{ position: "relative", width: 34, height: 34 }}>
        {task.animated && ripple > 0 && ripple < 1 ? (
          <div
            style={{
              position: "absolute",
              inset: -24 * ripple,
              borderRadius: "50%",
              background: APP.success,
              opacity: 0.35 * (1 - ripple),
            }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `2.5px solid ${done > 0.5 ? APP.success : "#c3c8d4"}`,
            background: done > 0.01 ? APP.success : "white",
            display: "grid",
            placeItems: "center",
            scale: String(1 + Math.sin(done * Math.PI) * 0.25),
          }}
        >
          <Icon icon={faCheck} size={18} color="white" style={{ opacity: done, scale: String(done) }} />
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 21,
            fontWeight: 800,
            textDecoration: done > 0.5 ? "line-through" : "none",
            opacity: 1 - done * 0.5,
            whiteSpace: "nowrap",
          }}
        >
          {task.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 600, color: APP.muted }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: task.color }} />
          {task.subject}
        </div>
      </div>
      <div
        style={{
          padding: "6px 12px",
          borderRadius: 999,
          fontSize: 15,
          fontWeight: 800,
          ...(done > 0.5 ? { color: APP.success, background: "#e3f6ea" } : DUE_STYLE[task.tone]),
        }}
      >
        {done > 0.5 ? "Hecha" : task.due}
      </div>
    </div>
  );
};

const Group: React.FC<{ name: string; tasks: Task[]; delay: number }> = ({ name, tasks, delay }) => {
  const p = useEnter(delay);
  return (
    <Card style={{ padding: "14px 20px 6px", marginBottom: 14, opacity: p, translate: `0 ${(1 - p) * 40}px` }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 19, fontWeight: 850 }}>
        <span style={{ color: name === "Atrasadas" ? APP.danger : APP.text }}>{name}</span>
        <span style={{ color: APP.muted }}>{tasks.length}</span>
      </div>
      {tasks.map((task) => (
        <TaskRow key={task.title} task={task} />
      ))}
    </Card>
  );
};

const TareasScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const pendientes = frame >= TAP + 6 ? 4 : 5;
  return (
    <>
      <ScreenHeader title="Tareas" subtitle={`${pendientes} pendientes`} />
      <div style={{ display: "flex", background: "#e8eaf2", borderRadius: 14, padding: 4, marginBottom: 16 }}>
        {["Pendientes", "Completadas", "Todas"].map((label, i) => (
          <div
            key={label}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "9px 0",
              borderRadius: 11,
              fontSize: 17,
              fontWeight: 800,
              background: i === 0 ? "white" : "transparent",
              color: i === 0 ? APP.text : APP.muted,
              boxShadow: i === 0 ? "0 2px 6px rgba(18,24,38,0.08)" : "none",
            }}
          >
            {label}
          </div>
        ))}
      </div>
      {GROUPS.map((group, i) => (
        <Group key={group.name} {...group} delay={PHONE_DELAY + 14 + i * 7} />
      ))}
    </>
  );
};

export const Tareas: React.FC = () => {
  return (
    <DarkBackground>
      <Phone activeTab={2} delay={PHONE_DELAY} style={{ left: 250, top: 50 }}>
        <TareasScreen />
      </Phone>
      <FloatCard delay={TAP + 6} style={{ left: 600, top: 300 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", display: "grid", placeItems: "center", background: APP.success }}>
          <Icon icon={faCheck} size={30} color="white" />
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 850 }}>¡Tarea completada!</div>
          <div style={{ fontSize: 20, color: APP.muted, fontWeight: 600 }}>Práctica 2 · Redes</div>
        </div>
      </FloatCard>
      <SceneCopy
        x={960}
        eyebrow="Tareas y entregas"
        eyebrowColor="#fda4af"
        title={
          <>
            Nada se te
            <br />
            <GradientText>escapa.</GradientText>
          </>
        }
        text="Atrasadas, para hoy y para esta semana. Ordenadas por urgencia y por asignatura."
      />
    </DarkBackground>
  );
};
