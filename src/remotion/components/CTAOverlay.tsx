import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface CTAOverlayProps {
  text: string;
  color?: string;
  backgroundColor?: string;
  rtl?: boolean;
}

export const CTAOverlay: React.FC<CTAOverlayProps> = ({
  text,
  color = "#ffffff",
  backgroundColor = "rgba(0, 0, 0, 0.75)",
  rtl = false,
}) => {
  const frame = useCurrentFrame();

  // Pulse animation: scale oscillates between 1 and 1.05
  const pulse = interpolate(Math.sin(frame * 0.15), [-1, 1], [1, 1.05]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        backgroundColor,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px 0",
        direction: rtl ? "rtl" : "ltr",
      }}
    >
      <span
        style={{
          color,
          fontSize: 36,
          fontWeight: 700,
          textAlign: "center",
          transform: `scale(${pulse})`,
          display: "inline-block",
        }}
      >
        {text}
      </span>
    </div>
  );
};
