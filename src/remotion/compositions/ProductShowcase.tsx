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

const ProductShowcase: React.FC<TemplateProps> = ({
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

      {/* Sequence 0-120: Product name + first image, image takes 60% */}
      <Sequence from={0} durationInFrames={120}>
        <AbsoluteFill>
          {/* Image area: top 60% */}
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "60%" }}>
            {images[0] && <ImageSlide src={images[0]} fit="cover" />}
          </div>
          {/* Product name + hook area: bottom 40% */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "40%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "32px 48px",
              gap: 20,
            }}
          >
            <TextOverlay
              text={productName}
              fontSize={48}
              color={primaryColor}
              fontFamily={fontFamily}
              rtl={rtl}
              style={{ fontWeight: 700, textAlign: "center" }}
            />
            <TextOverlay
              text={hook}
              fontSize={32}
              color={secondaryColor}
              fontFamily={fontFamily}
              rtl={rtl}
              style={{ textAlign: "center", opacity: 0.85 }}
            />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Sequence 120-300: Features one by one (60 frames each) with rotating images */}
      {featureLines.slice(0, 3).map((line, i) => (
        <Sequence key={i} from={120 + i * 60} durationInFrames={60}>
          <AbsoluteFill>
            {/* Rotating product image */}
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "55%" }}>
              {images[(i + 1) % Math.max(images.length, 1)] && (
                <ImageSlide
                  src={images[(i + 1) % Math.max(images.length, 1)]}
                  fit="contain"
                  style={{ backgroundColor }}
                />
              )}
            </div>
            {/* Feature text area */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: "45%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "32px 48px",
              }}
            >
              <FeatureEntry
                text={line}
                index={i}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                fontFamily={fontFamily}
                rtl={rtl}
                fps={fps}
              />
            </div>
          </AbsoluteFill>
        </Sequence>
      ))}

      {/* Sequence 300-390: Price display clean and prominent */}
      <Sequence from={300} durationInFrames={90}>
        <AbsoluteFill
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <PriceTag
            price={priceCallout}
            color="#ffffff"
            backgroundColor={primaryColor}
            fontSize={64}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Sequence 390-450: Simple CTA */}
      <Sequence from={390} durationInFrames={60}>
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
            backgroundColor={secondaryColor}
            rtl={rtl}
          />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

/** Single feature entry with staggered fade-in */
const FeatureEntry: React.FC<{
  text: string;
  index: number;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  rtl: boolean;
  fps: number;
}> = ({ text, index, primaryColor, secondaryColor, fontFamily, rtl, fps }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(frame, [0, 20], [30, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        display: "flex",
        alignItems: "center",
        gap: 16,
        direction: rtl ? "rtl" : "ltr",
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: secondaryColor,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: 38,
          color: primaryColor,
          fontFamily,
          lineHeight: 1.4,
          textAlign: "center",
        }}
      >
        {text}
      </span>
    </div>
  );
};

export default ProductShowcase;
