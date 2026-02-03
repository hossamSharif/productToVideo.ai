import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface TextOverlayProps {
  text: string;
  style?: React.CSSProperties;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  rtl?: boolean;
}

export const TextOverlay: React.FC<TextOverlayProps> = ({
  text,
  style,
  fontSize = 48,
  color = "#ffffff",
  fontFamily = "sans-serif",
  rtl = false,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        fontSize,
        color,
        fontFamily,
        direction: rtl ? "rtl" : "ltr",
        textAlign: rtl ? "right" : "left",
        lineHeight: 1.3,
        ...style,
      }}
    >
      {text}
    </div>
  );
};
