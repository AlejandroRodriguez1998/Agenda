import {
  faBolt,
  faBook,
  faCalendarDays,
  faChartColumn,
  faClock,
  faGraduationCap,
  faListCheck,
} from "@fortawesome/free-solid-svg-icons";
import type React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Icon } from "../components/Icon";
import {
  BrandBackground,
  GradientText,
  Rise,
  useEnter,
} from "../components/ui";

/** Icono de cristal que aparece alrededor del titular. */
const Tile: React.FC<{
  icon: Parameters<typeof Icon>[0]["icon"];
  color: string;
  delay: number;
  x: number;
  y: number;
  tilt: number;
}> = ({ icon, color, delay, x, y, tilt }) => {
  const frame = useCurrentFrame();
  const p = useEnter(delay, 12);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 132,
        height: 132,
        borderRadius: 36,
        display: "grid",
        placeItems: "center",
        background: "rgba(255,255,255,0.16)",
        border: "1.5px solid rgba(255,255,255,0.35)",
        boxShadow: "0 24px 50px rgba(20,10,60,0.3)",
        opacity: p,
        scale: String(p),
        rotate: `${tilt * p}deg`,
        translate: `0 ${Math.sin((frame + delay * 3) / 22) * 14}px`,
      }}
    >
      <Icon icon={icon} size={58} color={color} />
    </div>
  );
};

const WORDS_1 = ["Tu", "vida", "académica,"];

export const Intro: React.FC = () => {
  return (
    <BrandBackground>
      <Tile icon={faCalendarDays} color="#c7d2fe" delay={20} x={230} y={170} tilt={-10} />
      <Tile icon={faClock} color="#a5f3fc" delay={26} x={190} y={720} tilt={8} />
      <Tile icon={faListCheck} color="#fecdd3" delay={32} x={1580} y={180} tilt={10} />
      <Tile icon={faChartColumn} color="#bbf7d0" delay={38} x={1610} y={700} tilt={-8} />
      <Tile icon={faBook} color="#fde68a" delay={44} x={900} y={860} tilt={-4} />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 40,
          textAlign: "center",
        }}
      >
        <Rise delay={0} style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 24,
              display: "grid",
              placeItems: "center",
              background: "rgba(255,255,255,0.18)",
              border: "1.5px solid rgba(255,255,255,0.4)",
            }}
          >
            <Icon icon={faGraduationCap} size={44} color="white" />
          </div>
          <span style={{ fontSize: 56, fontWeight: 850, letterSpacing: "-0.03em" }}>
            Agenda Académica
          </span>
        </Rise>

        <div
          style={{
            fontSize: 148,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-0.05em",
          }}
        >
          <div style={{ display: "flex", gap: 36, justifyContent: "center" }}>
            {WORDS_1.map((word, i) => (
              <Rise key={word} delay={8 + i * 5} distance={70}>
                {word}
              </Rise>
            ))}
          </div>
          <Rise delay={26} distance={70} style={{ marginTop: 10 }}>
            <GradientText>en un solo sitio.</GradientText>
          </Rise>
        </div>

        <Rise
          delay={38}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "16px 30px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.16)",
            border: "1.5px solid rgba(255,255,255,0.32)",
            fontSize: 34,
            fontWeight: 700,
          }}
        >
          <Icon icon={faBolt} size={30} color="#fde68a" />
          Horario · Tareas · Entregas · Notas
        </Rise>
      </AbsoluteFill>
    </BrandBackground>
  );
};
