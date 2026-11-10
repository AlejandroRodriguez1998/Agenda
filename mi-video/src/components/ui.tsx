import type React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BRAND, fontFamily } from "../theme";

/** Progreso 0→1 con muelle suave, empezando en `delay` frames. */
export const useEnter = (delay = 0, damping = 200) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping } });
};

/** Aparece subiendo y desenfocándose. */
export const Rise: React.FC<{
  delay?: number;
  distance?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, distance = 40, children, style }) => {
  const p = useEnter(delay);
  return (
    <div
      style={{
        opacity: p,
        translate: `0 ${(1 - p) * distance}px`,
        filter: `blur(${(1 - p) * 10}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Manchas de color difuminadas que se mueven lentamente. */
const Blobs: React.FC<{ colors: [string, string, string]; opacity: number }> = ({
  colors,
  opacity,
}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const blob = (
    color: string,
    size: number,
    x: number,
    y: number,
    dx: number,
    dy: number,
    speed: number,
  ): React.CSSProperties => ({
    position: "absolute",
    width: size,
    height: size,
    left: x + Math.sin(t * speed) * dx,
    top: y + Math.cos(t * speed * 0.8) * dy,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${color} 0%, transparent 62%)`,
    filter: "blur(60px)",
    opacity,
    mixBlendMode: "screen",
  });
  return (
    <>
      <div style={blob(colors[0], 1300, -420, -520, 120, 80, 0.45)} />
      <div style={blob(colors[1], 1150, 1150, 380, 140, 90, 0.38)} />
      <div style={blob(colors[2], 800, 700, 200, 160, 120, 0.55)} />
    </>
  );
};

/** Fondo con el degradado de la marca (intro y cierre). */
export const BrandBackground: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: BRAND.gradient,
        backgroundSize: "200% 200%",
        backgroundPosition: `${interpolate(frame, [0, 300], [0, 100])}% 50%`,
        fontFamily,
        color: "white",
        overflow: "hidden",
      }}
    >
      <Blobs colors={["#22d3ee", "#f472b6", "#a78bfa"]} opacity={0.5} />
      {children}
    </AbsoluteFill>
  );
};

/** Fondo oscuro con brillos de color (escenas de producto). */
export const DarkBackground: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <AbsoluteFill
    style={{
      background: BRAND.dark,
      fontFamily,
      color: "white",
      overflow: "hidden",
    }}
  >
    <Blobs colors={["#4338ca", "#be185d", "#0e7490"]} opacity={0.55} />
    <AbsoluteFill
      style={{
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.07) 1.5px, transparent 1.5px)",
        backgroundSize: "36px 36px",
      }}
    />
    {children}
  </AbsoluteFill>
);

/** Etiqueta pequeña sobre los titulares. */
export const Eyebrow: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = "#a5b4fc",
}) => (
  <div
    style={{
      fontSize: 30,
      fontWeight: 800,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color,
    }}
  >
    {children}
  </div>
);

/** Texto con el degradado cian→rosa de la landing. */
export const GradientText: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <span
    style={{
      background: BRAND.textGradient,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
    }}
  >
    {children}
  </span>
);

/** Columna de texto a la izquierda en las escenas con móvil. */
export const SceneCopy: React.FC<{
  eyebrow: string;
  eyebrowColor?: string;
  title: React.ReactNode;
  text: string;
  children?: React.ReactNode;
  x?: number;
}> = ({ eyebrow, eyebrowColor, title, text, children, x = 150 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: 0,
      bottom: 0,
      width: 820,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: 30,
    }}
  >
    <Rise delay={4}>
      <Eyebrow color={eyebrowColor}>{eyebrow}</Eyebrow>
    </Rise>
    <Rise delay={9}>
      <div
        style={{
          fontSize: 104,
          fontWeight: 900,
          lineHeight: 1.02,
          letterSpacing: "-0.045em",
        }}
      >
        {title}
      </div>
    </Rise>
    <Rise delay={15}>
      <div
        style={{
          fontSize: 40,
          lineHeight: 1.45,
          fontWeight: 500,
          color: "rgba(255,255,255,0.75)",
          maxWidth: 720,
        }}
      >
        {text}
      </div>
    </Rise>
    {children}
  </div>
);

/** Tarjeta flotante blanca junto al móvil. */
export const FloatCard: React.FC<{
  delay: number;
  style: React.CSSProperties;
  children: React.ReactNode;
}> = ({ delay, style, children }) => {
  const frame = useCurrentFrame();
  const p = useEnter(delay, 14);
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "22px 30px 22px 22px",
        whiteSpace: "nowrap",
        borderRadius: 28,
        background: "rgba(255,255,255,0.96)",
        color: "#121826",
        boxShadow: "0 30px 70px rgba(0,0,0,0.4)",
        opacity: Math.min(1, p * 1.5),
        scale: String(0.6 + p * 0.4),
        translate: `0 ${Math.sin((frame - delay) / 18) * 8}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
