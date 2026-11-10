import {
  faBolt,
  faMobileScreen,
  faShieldHalved,
  faWifi,
} from "@fortawesome/free-solid-svg-icons";
import type React from "react";
import { AbsoluteFill } from "remotion";
import { Icon } from "../components/Icon";
import { DarkBackground, Eyebrow, GradientText, Rise, useEnter } from "../components/ui";

const TECH = [
  { name: "Next.js", color: "#ffffff" },
  { name: "React 19", color: "#61dafb" },
  { name: "TypeScript", color: "#3178c6" },
  { name: "Firebase Auth", color: "#ffca28" },
  { name: "Cloud Firestore", color: "#ff9100" },
  { name: "PWA", color: "#a78bfa" },
  { name: "Vercel", color: "#ffffff" },
];

const HIGHLIGHTS = [
  { icon: faBolt, color: "#fde68a", label: "Datos en tiempo real" },
  { icon: faWifi, color: "#67e8f9", label: "Offline-first" },
  { icon: faShieldHalved, color: "#86efac", label: "Reglas de seguridad" },
  { icon: faMobileScreen, color: "#f9a8d4", label: "Mobile-first" },
];

const Chip: React.FC<{ name: string; color: string; delay: number }> = ({ name, color, delay }) => {
  const p = useEnter(delay, 13);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "20px 34px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.08)",
        border: "1.5px solid rgba(255,255,255,0.16)",
        fontSize: 42,
        fontWeight: 800,
        letterSpacing: "-0.02em",
        opacity: p,
        scale: String(0.5 + p * 0.5),
      }}
    >
      <span style={{ width: 18, height: 18, borderRadius: "50%", background: color, boxShadow: `0 0 20px ${color}` }} />
      {name}
    </div>
  );
};

export const Stack: React.FC = () => {
  return (
    <DarkBackground>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 56, padding: "0 160px" }}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 18, alignItems: "center" }}>
          <Rise delay={2}>
            <Eyebrow>Bajo el capó</Eyebrow>
          </Rise>
          <Rise delay={6}>
            <div style={{ fontSize: 92, fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 1.05 }}>
              Moderna <GradientText>de principio a fin.</GradientText>
            </div>
          </Rise>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 24, maxWidth: 1500 }}>
          {TECH.map((t, i) => (
            <Chip key={t.name} {...t} delay={14 + i * 4} />
          ))}
        </div>
        <Rise delay={50} style={{ display: "flex", gap: 56, marginTop: 10 }}>
          {HIGHLIGHTS.map((h) => (
            <div key={h.label} style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 34, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
              <Icon icon={h.icon} size={32} color={h.color} />
              {h.label}
            </div>
          ))}
        </Rise>
      </AbsoluteFill>
    </DarkBackground>
  );
};
