import { Solid } from "remotion";
import { springTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import type React from "react";
import { Music } from "./components/Music";
import { Dashboard } from "./scenes/Dashboard";
import { Features } from "./scenes/Features";
import { Intro } from "./scenes/Intro";
import { Notas } from "./scenes/Notas";
import { Outro } from "./scenes/Outro";
import { Stack } from "./scenes/Stack";
import { Tareas } from "./scenes/Tareas";

/**
 * Vídeo promocional de Agenda Académica.
 * Duración total = suma de escenas (1065) − 6 transiciones × 20 = 945 frames (31,5 s a 30 fps).
 */
export const Promo: React.FC = () => {
  return (
    <>
      <Music />
      <TransitionSeries>
        <TransitionSeries.Sequence name="Intro" durationInFrames={120}>
          <Intro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: 20,
          })}
        />
        <TransitionSeries.Sequence
          name="Panel de inicio"
          durationInFrames={180}
        >
          <Dashboard />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: 20,
          })}
        />
        <TransitionSeries.Sequence name="Tareas" durationInFrames={165}>
          <Tareas />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: 20,
          })}
        />
        <TransitionSeries.Sequence name="Notas" durationInFrames={165}>
          <Notas />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: 20,
          })}
        />
        <TransitionSeries.Sequence
          name="Funcionalidades"
          durationInFrames={150}
        >
          <Features />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: 20,
          })}
        />
        <TransitionSeries.Sequence name="Tecnología" durationInFrames={135}>
          <Stack />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: 20,
          })}
        />
        <TransitionSeries.Sequence name="Cierre" durationInFrames={150}>
          <Outro />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Solid
        width={1920}
        height={1080}
        color="gray"
        style={{ position: "absolute" }}
      />
    </>
  );
};
