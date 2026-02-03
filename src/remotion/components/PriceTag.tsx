import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface PriceTagProps {
  price: string;
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
}

export const PriceTag: React.FC<PriceTagProps> = ({
  price,
  color = "#ffffff",
  backgroundColor = "#e11d48",
  fontSize = 40,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const scale = interpolate(frame, [0, 15], [0.8, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        display: "inline-block",
        backgroundColor,
        color,
        fontSize,
        fontWeight: 700,
        padding: "12px 28px",
        borderRadius: 12,
        lineHeight: 1.2,
      }}
    >
      {price}
    </div>
  );
};
