import { Audio } from "@remotion/media";
import { interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Banda sonora. Se salta los primeros 7,5 s del tema para que el subidón
 * (segundo 11 del tema) coincida con la entrada del panel de la app.
 */
export const Music: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  return (
    <Audio
      name="Música"
      src={staticFile("Solo LevelingARISE OST  Download Theme Video - Cyan.mp3")}
      trimBefore={7.5 * fps}
      volume={interpolate(
        frame,
        [0, 0.5 * fps, durationInFrames - 2.5 * fps, durationInFrames - 1],
        [0, 0.85, 0.85, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )}
    />
  );
};
