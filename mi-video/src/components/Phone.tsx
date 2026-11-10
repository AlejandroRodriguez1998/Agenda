import {
  faBatteryFull,
  faBook,
  faCalendarDays,
  faChartColumn,
  faHouse,
  faListCheck,
  faSignal,
  faWifi,
} from "@fortawesome/free-solid-svg-icons";
import type React from "react";
import { useCurrentFrame } from "remotion";
import { APP, fontFamily } from "../theme";
import { Icon } from "./Icon";
import { useEnter } from "./ui";

const NAV = [
  { icon: faHouse, label: "Inicio" },
  { icon: faCalendarDays, label: "Horario" },
  { icon: faListCheck, label: "Tareas" },
  { icon: faChartColumn, label: "Notas" },
  { icon: faBook, label: "Asignaturas" },
];

/** Barra de navegación inferior flotante, como en la app. */
const BottomNav: React.FC<{ active: number }> = ({ active }) => (
  <div
    style={{
      position: "absolute",
      left: 16,
      right: 16,
      bottom: 18,
      height: 92,
      borderRadius: 30,
      background: "rgba(255,255,255,0.94)",
      border: `1px solid ${APP.border}`,
      boxShadow: "0 12px 30px rgba(18,24,38,0.12)",
      display: "flex",
      justifyContent: "space-around",
      alignItems: "center",
    }}
  >
    {NAV.map((item, i) => (
      <div
        key={item.label}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          color: i === active ? APP.accent : "#9aa1b2",
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        <Icon icon={item.icon} size={26} />
        {item.label}
      </div>
    ))}
  </div>
);

/** Móvil con la interfaz de la app dentro. Entra desde abajo y flota. */
export const Phone: React.FC<{
  children: React.ReactNode;
  activeTab: number;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ children, activeTab, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const p = useEnter(delay, 18);
  return (
    <div
      style={{
        position: "absolute",
        width: 480,
        height: 980,
        borderRadius: 76,
        background: "linear-gradient(160deg, #2a2d3a, #0b0d14 40%)",
        padding: 14,
        boxShadow:
          "0 80px 140px rgba(0,0,0,0.6), inset 0 0 0 2px rgba(255,255,255,0.12)",
        opacity: p,
        translate: `0 ${(1 - p) * 260 + Math.sin(frame / 28) * 10}px`,
        rotate: `${(1 - p) * 8}deg`,
        ...style,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: 62,
          overflow: "hidden",
          background: APP.bg,
          color: APP.text,
          fontFamily,
        }}
      >
        <div
          style={{
            height: 62,
            padding: "0 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          <span>9:41</span>
          <span style={{ display: "flex", gap: 8 }}>
            <Icon icon={faSignal} size={17} />
            <Icon icon={faWifi} size={17} />
            <Icon icon={faBatteryFull} size={17} />
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            top: 14,
            left: "50%",
            marginLeft: -64,
            width: 128,
            height: 36,
            borderRadius: 20,
            background: "#000",
          }}
        />
        <div style={{ padding: "8px 26px 0" }}>{children}</div>
        <BottomNav active={activeTab} />
      </div>
    </div>
  );
};

/** Tarjeta blanca de la interfaz. */
export const Card: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      background: APP.surface,
      borderRadius: 22,
      border: `1px solid ${APP.border}`,
      boxShadow: "0 1px 2px rgba(18,24,38,0.04), 0 8px 24px rgba(18,24,38,0.06)",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Cabecera de página de la app (título + subtítulo). */
export const ScreenHeader: React.FC<{ title: string; subtitle: string }> = ({
  title,
  subtitle,
}) => (
  <div style={{ marginBottom: 18 }}>
    <div
      style={{ fontSize: 40, fontWeight: 850, letterSpacing: "-0.03em" }}
    >
      {title}
    </div>
    <div style={{ fontSize: 19, color: APP.muted, fontWeight: 600 }}>
      {subtitle}
    </div>
  </div>
);
