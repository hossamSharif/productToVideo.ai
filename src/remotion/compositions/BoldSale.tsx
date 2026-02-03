import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  AbsoluteFill,
  Img,
} from "remotion";
import { TextOverlay } from "../components/TextOverlay";
import { ImageSlide } from "../components/ImageSlide";
import { PriceTag } from "../components/PriceTag";
import { CTAOverlay } from "../components/CTAOverlay";
import { BackgroundMusic } from "../components/BackgroundMusic";

interface TemplateProps {
  productName: string;
  images: string[];
  hook: string;
  featureLines: string[];
  priceCallout: string;
  cta: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  musicUrl: string;
  fontFamily: string;
  rtl: boolean;
}

const BoldSale: React.FC<TemplateProps> = ({
  productName,
  images,
  hook,
  featureLines,
  priceCallout,
  cta,
  primaryColor,
  secondaryColor,
  backgroundColor,
  musicUrl,
  fontFamily,
  rtl,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor, fontFamily }}>
      <BackgroundMusic src={musicUrl} />

      {/* Sequence 0-60: Explosive hook entrance */}
      <Sequence from={0} durationInFrames={60}>
        <AbsoluteFill
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: primaryColor,
          }}
        >
          <HookSlam
            text={hook}
            fontFamily={fontFamily}
            rtl={rtl}
            fps={fps}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Sequence 60-240: Product images carousel (60 frames each) */}
      {images.slice(0, 3).map((img, i) => (
        <Sequence key={i} from={60 + i * 60} durationInFrames={60}>
          <AbsoluteFill>
            <ImageSlide src={img} fit="cover" />
            {/* Feature line overlay at bottom */}
            {featureLines[i] && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  padding: "40px 48px",
                  backgroundColor: "rgba(0,0,0,0.75)",
                }}
              >
                <TextOverlay
                  text={featureLines[i]}
                  fontSize={42}
                  color="#ffffff"
                  fontFamily={fontFamily}
                  rtl={rtl}
                  style={{
                    fontWeight: 800,
                    textAlign: "center",
                    textTransform: "uppercase",
                  }}
                />
              </div>
            )}
          </AbsoluteFill>
        </Sequence>
      ))}

      {/* Sequence 240-330: Price tag with flash/overshoot spring */}
      <Sequence from={240} durationInFrames={90}>
        <AbsoluteFill
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor,
          }}
        >
          <PriceFlash
            price={priceCallout}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            fps={fps}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Sequence 330-450: CTA with pulsing urgency */}
      <Sequence from={330} durationInFrames={120}>
        <AbsoluteFill
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: `linear-gradient(180deg, ${primaryColor}, ${secondaryColor})`,
          }}
        >
          <PulsingCTA
            text={cta}
            rtl={rtl}
          />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

/** Hook text that slams in from the top with spring */
const HookSlam: React.FC<{
  text: string;
  fontFamily: string;
  rtl: boolean;
  fps: number;
}> = ({ text, fontFamily, rtl, fps }) => {
  const frame = useCurrentFrame();

  const translateY = spring({
    frame,
    fps,
    config: { damping: 8, mass: 0.6, stiffness: 120 },
  });

  const y = interpolate(translateY, [0, 1], [-600, 0]);

  return (
    <div
      style={{
        transform: `translateY(${y}px)`,
        fontSize: 64,
        fontWeight: 900,
        color: "#ffffff",
        fontFamily,
        textAlign: "center",
        padding: "0 48px",
        direction: rtl ? "rtl" : "ltr",
        textTransform: "uppercase",
        letterSpacing: 2,
      }}
    >
      {text}
    </div>
  );
};

/** Price with spring overshoot flash effect */
const PriceFlash: React.FC<{
  price: string;
  primaryColor: string;
  secondaryColor: string;
  fps: number;
}> = ({ price, primaryColor, secondaryColor, fps }) => {
  const frame = useCurrentFrame();

  const scaleSpring = spring({
    frame,
    fps,
    config: { damping: 4, mass: 0.5, stiffness: 150 },
  });

  const scale = interpolate(scaleSpring, [0, 1], [0, 1]);

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      <PriceTag
        price={price}
        color="#ffffff"
        backgroundColor={primaryColor}
        fontSize={72}
      />
    </div>
  );
};

/** Pulsing CTA with urgency feel */
const PulsingCTA: React.FC<{
  text: string;
  rtl: boolean;
}> = ({ text, rtl }) => {
  const frame = useCurrentFrame();

  const pulse = interpolate(
    Math.sin(frame * 0.2),
    [-1, 1],
    [0.95, 1.1]
  );

  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${pulse})`,
        fontSize: 56,
        fontWeight: 900,
        color: "#ffffff",
        textAlign: "center",
        padding: "0 48px",
        direction: rtl ? "rtl" : "ltr",
        textTransform: "uppercase",
      }}
    >
      {text}
    </div>
  );
};

export default BoldSale;
