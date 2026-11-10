import { faArrowRight, faGlobe } from "@fortawesome/free-solid-svg-icons";
import type React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Icon } from "../components/Icon";
import { BrandBackground, GradientText, Rise, useEnter } from "../components/ui";

const AppIcon: React.FC = () => {
  const frame = useCurrentFrame();
  const p = useEnter(0, 11);
  return (
    <Img
      src={staticFile("icon.png")}
      style={{
        width: 230,
        height: 230,
        borderRadius: 56,
        boxShadow: "0 40px 80px rgba(30,10,80,0.45)",
        opacity: Math.min(1, p * 2),
        scale: String(0.3 + p * 0.7),
        rotate: `${(1 - p) * -25}deg`,
        translate: `0 ${Math.sin(frame / 25) * 8}px`,
      }}
    />
  );
};

export const Outro: React.FC = () => {
  return (
    <BrandBackground>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 34, textAlign: "center" }}>
        <AppIcon />
        <Rise delay={10}>
          <div style={{ fontSize: 132, fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1 }}>
            Agenda Académica
          </div>
        </Rise>
        <Rise delay={16}>
          <div style={{ fontSize: 60, fontWeight: 800, letterSpacing: "-0.03em" }}>
            <GradientText>Tu curso, en orden.</GradientText>
          </div>
        </Rise>
        <Rise
          delay={26}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            marginTop: 14,
            padding: "22px 40px",
            borderRadius: 24,
            background: "white",
            color: "#3730a3",
            fontSize: 40,
            fontWeight: 850,
            boxShadow: "0 24px 60px rgba(30,10,80,0.35)",
          }}
        >
          <Icon icon={faGlobe} size={36} />
          agenda-topaz-two.vercel.app
          <Icon icon={faArrowRight} size={32} />
        </Rise>
      </AbsoluteFill>
      <Rise
        delay={36}
        style={{
          position: "absolute",
          bottom: 90,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 34,
          fontWeight: 600,
          color: "rgba(255,255,255,0.85)",
        }}
      >
        Diseñada y desarrollada por <b style={{ color: "white" }}>Alejandro Paniagua Rodriguez</b>
      </Rise>
    </BrandBackground>
  );
};
