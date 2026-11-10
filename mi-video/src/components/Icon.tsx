import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import type React from "react";

/** Pinta un icono de Font Awesome como SVG plano (sin CSS global). */
export const Icon: React.FC<{
  icon: IconDefinition;
  size: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ icon, size, color = "currentColor", style }) => {
  const [w, h, , , path] = icon.icon;
  const paths = Array.isArray(path) ? path : [path];
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      style={{ height: size, width: (size * w) / h, flexShrink: 0, ...style }}
      fill={color}
    >
      {paths.map((d) => (
        <path key={d.slice(0, 24)} d={d} />
      ))}
    </svg>
  );
};
