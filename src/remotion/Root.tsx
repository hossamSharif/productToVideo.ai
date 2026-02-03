import { Composition } from "remotion";
import MinimalLuxury from "./compositions/MinimalLuxury";
import BoldSale from "./compositions/BoldSale";
import ProductShowcase from "./compositions/ProductShowcase";
import StorySwipe from "./compositions/StorySwipe";
import CleanModern from "./compositions/CleanModern";

const defaultProps = {
  productName: "",
  images: [],
  hook: "",
  featureLines: [],
  priceCallout: "",
  cta: "",
  primaryColor: "#000000",
  secondaryColor: "#666666",
  backgroundColor: "#ffffff",
  musicUrl: "",
  fontFamily: "sans-serif",
  rtl: false,
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MinimalLuxury"
        component={MinimalLuxury}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
      />
      <Composition
        id="BoldSale"
        component={BoldSale}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
      />
      <Composition
        id="ProductShowcase"
        component={ProductShowcase}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
      />
      <Composition
        id="StorySwipe"
        component={StorySwipe}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
      />
      <Composition
        id="CleanModern"
        component={CleanModern}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
      />
    </>
  );
};
