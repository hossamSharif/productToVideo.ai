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

/** Swipe card wrapper: slides in from the right (or left for RTL) */
const SwipeCard: React.FC<{
  children: React.ReactNode;
  rtl: boolean;
  backgroundColor: string;
  fps: number;
}> = ({ children, rtl, backgroundColor, fps }) => {
  const frame = useCurrentFrame();

  const slideProgress = spring({
    frame,
    fps,
    config: { damping: 15, mass: 0.8, stiffness: 100 },
  });

  const direction = rtl ? -1 : 1;
  const translateX = interpolate(slideProgress, [0, 1], [1080 * direction, 0]);

  return (
    <AbsoluteFill
      style={{
        transform: `translateX(${translateX}px)`,
        backgroundColor,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const StorySwipe: React.FC<TemplateProps> = ({
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
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor, fontFamily }}>
      <BackgroundMusic src={musicUrl} />

      {/* Card 1 (0-90): Hook + hero image */}
      <Sequence from={0} durationInFrames={90}>
        <SwipeCard rtl={rtl} backgroundColor={backgroundColor} fps={fps}>
          <AbsoluteFill>
            {images[0] && (
              <div style={{ width: "100%", height: "65%", position: "absolute", top: 0 }}>
                <ImageSlide src={images[0]} fit="cover" />
              </div>
            )}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                width: "100%",
                height: "35%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "32px 48px",
                gap: 16,
              }}
            >
              <TextOverlay
                text={hook}
                fontSize={48}
                color={primaryColor}
                fontFamily={fontFamily}
                rtl={rtl}
                style={{ textAlign: "center", fontWeight: 700 }}
              />
            </div>
          </AbsoluteFill>
        </SwipeCard>
      </Sequence>

      {/* Card 2 (90-210): Features with supporting images */}
      <Sequence from={90} durationInFrames={120}>
        <SwipeCard rtl={rtl} backgroundColor={backgroundColor} fps={fps}>
          <AbsoluteFill
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "60px 48px",
              gap: 32,
            }}
          >
            {/* Supporting image */}
            {images[1] && (
              <div
                style={{
                  width: "100%",
                  height: 400,
                  borderRadius: 20,
                  overflow: "hidden",
                }}
              >
                <Img
                  src={images[1]}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            )}
            {/* Feature lines */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 24,
                flex: 1,
                justifyContent: "center",
              }}
            >
              {featureLines.map((line, i) => (
                <FeatureLine
                  key={i}
                  text={line}
                  index={i}
                  color={primaryColor}
                  accentColor={secondaryColor}
                  fontFamily={fontFamily}
                  rtl={rtl}
                />
              ))}
            </div>
          </AbsoluteFill>
        </SwipeCard>
      </Sequence>

      {/* Card 3 (210-330): Price reveal */}
      <Sequence from={210} durationInFrames={120}>
        <SwipeCard rtl={rtl} backgroundColor={backgroundColor} fps={fps}>
          <AbsoluteFill
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 32,
            }}
          >
            <TextOverlay
              text={productName}
              fontSize={44}
              color={primaryColor}
              fontFamily={fontFamily}
              rtl={rtl}
              style={{ textAlign: "center", fontWeight: 600 }}
            />
            <PriceTag
              price={priceCallout}
              color="#ffffff"
              backgroundColor={secondaryColor}
              fontSize={64}
            />
          </AbsoluteFill>
        </SwipeCard>
      </Sequence>

      {/* Card 4 (330-450): CTA card */}
      <Sequence from={330} durationInFrames={120}>
        <SwipeCard rtl={rtl} backgroundColor={primaryColor} fps={fps}>
          <AbsoluteFill
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CTAOverlay
              text={cta}
              color="#ffffff"
              backgroundColor="transparent"
              rtl={rtl}
            />
          </AbsoluteFill>
        </SwipeCard>
      </Sequence>
    </AbsoluteFill>
  );
};

/** Staggered feature line */
const FeatureLine: React.FC<{
  text: string;
  index: number;
  color: string;
  accentColor: string;
  fontFamily: string;
  rtl: boolean;
}> = ({ text, index, color, accentColor, fontFamily, rtl }) => {
  const frame = useCurrentFrame();

  const delay = index * 12;
  const opacity = interpolate(frame, [delay, delay + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateX = interpolate(frame, [delay, delay + 20], [rtl ? -40 : 40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${translateX}px)`,
        display: "flex",
        alignItems: "center",
        gap: 16,
        direction: rtl ? "rtl" : "ltr",
      }}
    >
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          backgroundColor: accentColor,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: 34,
          color,
          fontFamily,
          lineHeight: 1.4,
        }}
      >
        {text}
      </span>
    </div>
  );
};

export default StorySwipe;
