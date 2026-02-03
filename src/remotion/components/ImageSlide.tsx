import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Img } from "remotion";

interface ImageSlideProps {
  src: string;
  style?: React.CSSProperties;
  fit?: "cover" | "contain";
}

export const ImageSlide: React.FC<ImageSlideProps> = ({
  src,
  style,
  fit = "cover",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const scale = interpolate(frame, [0, durationInFrames], [1, 1.05], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        ...style,
      }}
    >
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: fit,
          transform: `scale(${scale})`,
        }}
      />
    </div>
  );
};
