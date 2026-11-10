import {
  faCalendarDays,
  faChartColumn,
  faClock,
  faListCheck,
  faMoon,
  faWifi,
} from "@fortawesome/free-solid-svg-icons";
import type React from "react";
import { AbsoluteFill } from "remotion";
import { Icon } from "../components/Icon";
import { DarkBackground, Eyebrow, GradientText, Rise, useEnter } from "../components/ui";

const FUNCIONES = [
  { icon: faCalendarDays, color: "#8b84ff", title: "Calendario completo", text: "Semana, día y mes con clases, entregas y eventos." },
  { icon: faClock, color: "#22d3ee", title: "Horario semanal", text: "Añade cada clase una vez y se repite sola." },
  { icon: faListCheck, color: "#fb7185", title: "Tareas y entregas", text: "Atrasadas, para hoy y para esta semana." },
  { icon: faChartColumn, color: "#34d399", title: "Notas y medias", text: "Pesos por evaluación y medias al momento." },
  { icon: faWifi, color: "#fbbf24", title: "Funciona sin conexión", text: "Se sincroniza sola al recuperar la red." },
  { icon: faMoon, color: "#c084fc", title: "Claro u oscuro", text: "Para estudiar de día o de noche." },
];

const FeatureCard: React.FC<(typeof FUNCIONES)[number] & { delay: number }> = ({
  icon,
  color,
  title,
  text,
  delay,
}) => {
  const p = useEnter(delay, 16);
  return (
    <div
      style={{
        width: 500,
        padding: "34px 36px",
        borderRadius: 32,
        background: "rgba(255,255,255,0.06)",
        border: "1.5px solid rgba(255,255,255,0.12)",
        boxShadow: "0 30px 60px rgba(0,0,0,0.25)",
        opacity: p,
        scale: String(0.85 + p * 0.15),
        translate: `0 ${(1 - p) * 60}px`,
      }}
    >
      <div
        style={{
          width: 76,
          height: 76,
          borderRadius: 22,
          display: "grid",
          placeItems: "center",
          background: `${color}26`,
          marginBottom: 22,
        }}
      >
        <Icon icon={icon} size={38} color={color} />
      </div>
      <div style={{ fontSize: 38, fontWeight: 850, letterSpacing: "-0.02em", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 27, lineHeight: 1.4, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{text}</div>
    </div>
  );
};

export const Features: React.FC = () => {
  return (
    <DarkBackground>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 64 }}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 18, alignItems: "center" }}>
          <Rise delay={2}>
            <Eyebrow>Todo lo que necesitas</Eyebrow>
          </Rise>
          <Rise delay={6}>
            <div style={{ fontSize: 92, fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 1.05 }}>
              Menos apps, <GradientText>más tiempo para estudiar.</GradientText>
            </div>
          </Rise>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 500px)", gap: 36 }}>
          {FUNCIONES.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={16 + i * 6} />
          ))}
        </div>
      </AbsoluteFill>
    </DarkBackground>
  );
};
