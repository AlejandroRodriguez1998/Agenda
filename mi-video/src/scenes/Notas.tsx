import { faScaleBalanced } from "@fortawesome/free-solid-svg-icons";
import type React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
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
const GAUGE_START = PHONE_DELAY + 14;

/** Un arco por curso: progreso de asignaturas evaluadas. */
const CURSOS = [
  { label: "1º", color: "#ff4d4f", progress: 1 },
  { label: "2º", color: "#fadb14", progress: 1 },
  { label: "3º", color: "#52c41a", progress: 0.8 },
  { label: "4º", color: "#1677ff", progress: 0.45 },
];

const NOTAS = [
  { name: "Bases de Datos", color: SUBJECT.bd, nota: 9.0 },
  { name: "Sistemas Distribuidos", color: SUBJECT.distribuidos, nota: 8.4 },
  { name: "Sistemas Operativos", color: SUBJECT.so, nota: 7.9 },
  { name: "Redes", color: SUBJECT.redes, nota: 7.1 },
  { name: "Inteligencia Artificial", color: SUBJECT.ia, nota: 6.8 },
];

const toneFor = (nota: number) =>
  nota >= 9
    ? { color: APP.success, background: "#e3f6ea" }
    : nota >= 7
      ? { color: APP.accent, background: "#eceafe" }
      : { color: APP.warning, background: "#fdf3e1" };

const Gauge: React.FC = () => {
  const frame = useCurrentFrame();
  const cx = 200;
  const cy = 190;
  const media = interpolate(frame, [GAUGE_START, GAUGE_START + 40], [0, 7.82], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  return (
    <Card style={{ padding: "18px 18px 16px", marginBottom: 14 }}>
      <div style={{ position: "relative", height: 210 }}>
        <svg viewBox="0 0 400 210" style={{ width: "100%", height: 210 }}>
          {CURSOS.map((curso, i) => {
            const r = 176 - i * 30;
            const len = Math.PI * r;
            const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
            const p = interpolate(
              frame,
              [GAUGE_START + i * 5, GAUGE_START + i * 5 + 34],
              [0, curso.progress],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            );
            return (
              <g key={curso.label}>
                <path d={d} fill="none" stroke="#eceef4" strokeWidth={20} strokeLinecap="round" />
                <path
                  d={d}
                  fill="none"
                  stroke={curso.color}
                  strokeWidth={20}
                  strokeLinecap="round"
                  strokeDasharray={`${len} ${len}`}
                  strokeDashoffset={len * (1 - p)}
                  opacity={p > 0.005 ? 1 : 0}
                />
              </g>
            );
          })}
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, textAlign: "center" }}>
          <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1 }}>
            {media.toFixed(2).replace(".", ",")}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: APP.muted }}>Media global</div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 10 }}>
        {CURSOS.map((curso) => (
          <span key={curso.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 16, fontWeight: 700, color: APP.muted }}>
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: curso.color }} />
            {curso.label}
          </span>
        ))}
      </div>
    </Card>
  );
};

const NotaRow: React.FC<(typeof NOTAS)[number] & { delay: number }> = ({ name, color, nota, delay }) => {
  const p = useEnter(delay);
  return (
    <div style={{ padding: "10px 0", opacity: p, translate: `${(1 - p) * 50}px 0` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: color }} />
        <span style={{ flex: 1, fontSize: 19, fontWeight: 800 }}>{name}</span>
        <span style={{ padding: "4px 11px", borderRadius: 10, fontSize: 17, fontWeight: 850, ...toneFor(nota) }}>
          {nota.toFixed(1).replace(".", ",")}
        </span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: APP.soft, marginTop: 8, overflow: "hidden" }}>
        <div style={{ width: `${nota * 10 * p}%`, height: "100%", borderRadius: 4, background: color }} />
      </div>
    </div>
  );
};

const NotasScreen: React.FC = () => (
  <>
    <ScreenHeader title="Notas" subtitle="6 de 7 asignaturas evaluadas" />
    <Gauge />
    <Card style={{ padding: "8px 20px" }}>
      {NOTAS.map((n, i) => (
        <NotaRow key={n.name} {...n} delay={GAUGE_START + 16 + i * 5} />
      ))}
    </Card>
  </>
);

export const Notas: React.FC = () => {
  return (
    <DarkBackground>
      <SceneCopy
        eyebrow="Notas y medias"
        eyebrowColor="#86efac"
        title={
          <>
            Tus medias,
            <br />
            <GradientText>al momento.</GradientText>
          </>
        }
        text="Pesos por evaluación y medias por asignatura y por curso, calculadas solas."
      />
      <Phone activeTab={3} delay={PHONE_DELAY} style={{ left: 1240, top: 50 }}>
        <NotasScreen />
      </Phone>
      <FloatCard delay={76} style={{ left: 960, top: 870 }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, display: "grid", placeItems: "center", background: "#eceafe" }}>
          <Icon icon={faScaleBalanced} size={30} color={APP.accent} />
        </div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 850 }}>Examen 60% · Prácticas 40%</div>
          <div style={{ fontSize: 20, color: APP.muted, fontWeight: 600 }}>
            Nota final: <b style={{ color: APP.text }}>8,4</b>
          </div>
        </div>
      </FloatCard>
    </DarkBackground>
  );
};
