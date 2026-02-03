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

const MinimalLuxury: React.FC<TemplateProps> = ({
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

      {/* Sequence 0-90: Hero image with slow zoom + hook */}
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill>
          {images[0] && (
            <ImageSlide src={images[0]} fit="cover" />
          )}
          {/* Semi-transparent dark overlay at bottom */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              padding: "60px 48px",
              background:
                "linear-gradient(transparent, rgba(0,0,0,0.7))",
            }}
          >
            <TextOverlay
              text={hook}
              fontSize={52}
              color="#ffffff"
              fontFamily={fontFamily}
              rtl={rtl}
              style={{ textAlign: "center" }}
            />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Sequence 90-270: Feature lines cycling (90 frames each) */}
      {featureLines.slice(0, 2).map((line, i) => (
        <Sequence key={i} from={90 + i * 90} durationInFrames={90}>
          <AbsoluteFill>
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "48px",
              }}
            >
              {/* Small product image in corner */}
              {images[i + 1] && (
                <div
                  style={{
                    position: "absolute",
                    top: 60,
                    [rtl ? "left" : "right"]: 60,
                    width: 200,
                    height: 200,
                    borderRadius: 16,
                    overflow: "hidden",
                    border: `2px solid ${secondaryColor}`,
                  }}
                >
                  <Img
                    src={images[i + 1]}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}

              <TextOverlay
                text={line}
                fontSize={44}
                color={primaryColor}
                fontFamily={fontFamily}
                rtl={rtl}
                style={{ textAlign: "center", maxWidth: "85%" }}
              />
            </div>
          </AbsoluteFill>
        </Sequence>
      ))}

      {/* Sequence 270-360: Price tag centered with scale-in */}
      <Sequence from={270} durationInFrames={90}>
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 24,
          }}
        >
          <TextOverlay
            text={productName}
            fontSize={40}
            color={primaryColor}
            fontFamily={fontFamily}
            rtl={rtl}
            style={{ textAlign: "center" }}
          />
          <PriceTag
            price={priceCallout}
            color="#ffffff"
            backgroundColor={secondaryColor}
            fontSize={56}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Sequence 360-450: CTA full screen with gradient */}
      <Sequence from={360} durationInFrames={90}>
        <AbsoluteFill
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
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
      </Sequence>
    </AbsoluteFill>
  );
};

export default MinimalLuxury;
