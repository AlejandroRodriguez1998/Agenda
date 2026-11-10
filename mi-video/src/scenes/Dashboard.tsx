import { faBell, faClock } from "@fortawesome/free-solid-svg-icons";
import type React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Icon } from "../components/Icon";
import { Card, Phone } from "../components/Phone";
import {
  DarkBackground,
  FloatCard,
  GradientText,
  SceneCopy,
  useEnter,
} from "../components/ui";
import { APP, SUBJECT } from "../theme";

const PHONE_DELAY = 6;

const Stat: React.FC<{ value: number; decimals?: number; label: string; delay: number }> = ({
  value,
  decimals = 0,
  label,
  delay,
}) => {
  const frame = useCurrentFrame();
  const n = interpolate(frame, [delay, delay + 30], [0, value], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <Card style={{ flex: 1, padding: "14px 16px" }}>
      <div style={{ fontSize: 36, fontWeight: 850, letterSpacing: "-0.03em" }}>
        {n.toFixed(decimals).replace(".", ",")}
      </div>
      <div style={{ fontSize: 16, color: APP.muted, fontWeight: 600 }}>{label}</div>
    </Card>
  );
};

const WEEK = [
  ["L", 12],
  ["M", 13],
  ["X", 14],
  ["J", 15],
  ["V", 16],
  ["S", 17],
  ["D", 18],
] as const;

const AGENDA = [
  { hora: "09:00", title: "Sistemas Distribuidos", sub: "Teórica", color: SUBJECT.distribuidos },
  { hora: "Entrega", title: "Práctica 2: sockets", sub: "Redes", color: SUBJECT.redes },
  { hora: "11:30", title: "Bases de Datos", sub: "Laboratorio", color: SUBJECT.bd },
  { hora: "16:00", title: "Inteligencia Artificial", sub: "Teórica", color: SUBJECT.ia },
];

const AgendaItem: React.FC<(typeof AGENDA)[number] & { delay: number }> = ({
  hora,
  title,
  sub,
  color,
  delay,
}) => {
  const p = useEnter(delay);
  return (
    <Card
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "12px 16px",
        borderLeft: `7px solid ${color}`,
        opacity: p,
        translate: `${(1 - p) * 60}px 0`,
      }}
    >
      <div style={{ width: 78, fontSize: 17, fontWeight: 800, color }}>{hora}</div>
      <div>
        <div style={{ fontSize: 21, fontWeight: 800 }}>{title}</div>
        <div style={{ fontSize: 16, color: APP.muted, fontWeight: 600 }}>{sub}</div>
      </div>
    </Card>
  );
};

const DashboardScreen: React.FC = () => {
  const d = PHONE_DELAY + 12;
  return (
    <>
      <div style={{ fontSize: 18, color: APP.muted, fontWeight: 700 }}>
        Miércoles, 14 de octubre
      </div>
      <div style={{ fontSize: 36, fontWeight: 850, letterSpacing: "-0.03em", marginBottom: 18 }}>
        Buenas tardes, Lucía
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <Stat value={4} label="clases hoy" delay={d} />
        <Stat value={3} label="entregas" delay={d + 4} />
        <Stat value={7.8} decimals={1} label="media" delay={d + 8} />
      </div>
      <Card style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", marginBottom: 20 }}>
        {WEEK.map(([letter, day]) => {
          const today = day === 14;
          return (
            <div
              key={day}
              style={{
                width: 50,
                padding: "8px 0",
                borderRadius: 14,
                textAlign: "center",
                background: today ? APP.accent : "transparent",
                color: today ? "white" : APP.text,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, opacity: 0.7 }}>{letter}</div>
              <div style={{ fontSize: 22, fontWeight: 850 }}>{day}</div>
            </div>
          );
        })}
      </Card>
      <div style={{ fontSize: 22, fontWeight: 850, marginBottom: 12 }}>Hoy</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {AGENDA.map((item, i) => (
          <AgendaItem key={item.title} {...item} delay={d + 14 + i * 6} />
        ))}
      </div>
    </>
  );
};

export const Dashboard: React.FC = () => {
  return (
    <DarkBackground>
      <SceneCopy
        eyebrow="Panel de inicio"
        title={
          <>
            Tu día,
            <br />
            <GradientText>de un vistazo.</GradientText>
          </>
        }
        text="Clases, entregas y tu media actual nada más abrir la app."
      />
      <Phone activeTab={0} delay={PHONE_DELAY} style={{ left: 1240, top: 50 }}>
        <DashboardScreen />
      </Phone>
      <FloatCard delay={70} style={{ left: 1450, top: 850 }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, display: "grid", placeItems: "center", background: "#eef0ff" }}>
          <Icon icon={faClock} size={32} color={APP.accent} />
        </div>
        <div>
          <div style={{ fontSize: 26, fontWeight: 850 }}>09:00 · Aula 2.4</div>
          <div style={{ fontSize: 20, color: APP.muted, fontWeight: 600 }}>Próxima clase</div>
        </div>
      </FloatCard>
      <FloatCard delay={84} style={{ left: 1000, top: 300 }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, display: "grid", placeItems: "center", background: "#fff1f2" }}>
          <Icon icon={faBell} size={30} color={SUBJECT.redes} />
        </div>
        <div>
          <div style={{ fontSize: 26, fontWeight: 850 }}>3 entregas</div>
          <div style={{ fontSize: 20, color: APP.muted, fontWeight: 600 }}>esta semana</div>
        </div>
      </FloatCard>
    </DarkBackground>
  );
};
