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

const CleanModern: React.FC<TemplateProps> = ({
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

      {/* Sequence 0-90: Split layout - image left/right, hook text opposite */}
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: rtl ? "column-reverse" : "column",
          }}
        >
          {/* Image half (top for LTR on mobile 9:16) */}
          <div style={{ width: "100%", height: "50%", overflow: "hidden" }}>
            {images[0] && <ImageSlide src={images[0]} fit="cover" />}
          </div>
          {/* Text half */}
          <div
            style={{
              width: "100%",
              height: "50%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "40px 48px",
              gap: 20,
            }}
          >
            <TextOverlay
              text={productName}
              fontSize={36}
              color={secondaryColor}
              fontFamily={fontFamily}
              rtl={rtl}
              style={{ fontWeight: 500, textTransform: "uppercase", letterSpacing: 2 }}
            />
            <TextOverlay
              text={hook}
              fontSize={46}
              color={primaryColor}
              fontFamily={fontFamily}
              rtl={rtl}
              style={{ fontWeight: 700, lineHeight: 1.2 }}
            />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Sequence 90-270: Features with staggered fade-in, image changes */}
      <Sequence from={90} durationInFrames={180}>
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Rotating image */}
          <div style={{ width: "100%", height: "45%", overflow: "hidden" }}>
            <RotatingImage images={images} intervalFrames={60} />
          </div>
          {/* Features list */}
          <div
            style={{
              width: "100%",
              height: "55%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "32px 48px",
              gap: 28,
            }}
          >
            {featureLines.map((line, i) => (
              <StaggeredFeature
                key={i}
                text={line}
                index={i}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                fontFamily={fontFamily}
                rtl={rtl}
              />
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Sequence 270-360: Price in a card component centered */}
      <Sequence from={270} durationInFrames={90}>
        <AbsoluteFill
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <PriceCard
            productName={productName}
            price={priceCallout}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            backgroundColor={backgroundColor}
            fontFamily={fontFamily}
            rtl={rtl}
            fps={fps}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Sequence 360-450: CTA with subtle gradient */}
      <Sequence from={360} durationInFrames={90}>
        <AbsoluteFill
          style={{
            background: `linear-gradient(160deg, ${backgroundColor} 0%, ${secondaryColor}33 50%, ${primaryColor}22 100%)`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CTAOverlay
            text={cta}
            color={primaryColor}
            backgroundColor={`${secondaryColor}dd`}
            rtl={rtl}
          />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

/** Rotates through images at a given interval */
const RotatingImage: React.FC<{
  images: string[];
  intervalFrames: number;
}> = ({ images, intervalFrames }) => {
  const frame = useCurrentFrame();

  if (images.length === 0) return null;

  const currentIndex = Math.floor(frame / intervalFrames) % images.length;
  const src = images[currentIndex];

  const localFrame = frame % intervalFrames;
  const opacity = interpolate(localFrame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ width: "100%", height: "100%", opacity }}>
      {src && (
        <Img
          src={src}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}
    </div>
  );
};

/** Feature line with staggered animation */
const StaggeredFeature: React.FC<{
  text: string;
  index: number;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  rtl: boolean;
}> = ({ text, index, primaryColor, secondaryColor, fontFamily, rtl }) => {
  const frame = useCurrentFrame();

  const delay = index * 18;
  const opacity = interpolate(frame, [delay, delay + 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(frame, [delay, delay + 25], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        display: "flex",
        alignItems: "flex-start",
        gap: 16,
        direction: rtl ? "rtl" : "ltr",
      }}
    >
      <div
        style={{
          width: 4,
          height: 36,
          backgroundColor: secondaryColor,
          borderRadius: 2,
          flexShrink: 0,
          marginTop: 4,
        }}
      />
      <span
        style={{
          fontSize: 34,
          color: primaryColor,
          fontFamily,
          lineHeight: 1.4,
        }}
      >
        {text}
      </span>
    </div>
  );
};

/** Price displayed in a card */
const PriceCard: React.FC<{
  productName: string;
  price: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  rtl: boolean;
  fps: number;
}> = ({ productName, price, primaryColor, secondaryColor, backgroundColor, fontFamily, rtl, fps }) => {
  const frame = useCurrentFrame();

  const scaleSpring = spring({
    frame,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 100 },
  });

  const scale = interpolate(scaleSpring, [0, 1], [0.8, 1]);
  const opacity = interpolate(scaleSpring, [0, 1], [0, 1]);

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        backgroundColor: "#ffffff",
        borderRadius: 24,
        padding: "60px 56px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        direction: rtl ? "rtl" : "ltr",
      }}
    >
      <span
        style={{
          fontSize: 32,
          color: secondaryColor,
          fontFamily,
          fontWeight: 500,
        }}
      >
        {productName}
      </span>
      <PriceTag
        price={price}
        color="#ffffff"
        backgroundColor={primaryColor}
        fontSize={56}
      />
    </div>
  );
};

export default CleanModern;
