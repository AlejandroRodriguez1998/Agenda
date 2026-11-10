import { Composition, Folder, Still } from "remotion";
import { PortfolioCover } from "./portfolio/PortfolioCover";
import { Promo } from "./Promo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Promo"
        component={Promo}
        durationInFrames={945}
        fps={30}
        width={1920}
        height={1080}
      />
      <Folder name="Portfolio">
        <Still
          id="PortfolioCover"
          component={PortfolioCover}
          width={1672}
          height={941}
        />
      </Folder>
    </>
  );
};
