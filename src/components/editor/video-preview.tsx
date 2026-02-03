"use client";

import React from "react";
import { Player } from "@remotion/player";
import type {
  ProductData,
  VideoScript,
  ColorPalette,
  TemplateId,
} from "@/types";
import { getFontForLanguage, isRtlLanguage } from "@/lib/utils/font-for-language";

import MinimalLuxury from "@/remotion/compositions/MinimalLuxury";
import BoldSale from "@/remotion/compositions/BoldSale";
import ProductShowcase from "@/remotion/compositions/ProductShowcase";
import StorySwipe from "@/remotion/compositions/StorySwipe";
import CleanModern from "@/remotion/compositions/CleanModern";

interface VideoPreviewProps {
  templateId: TemplateId;
  productData: ProductData;
  script: VideoScript;
  colors: ColorPalette;
  musicTrackId: string | null;
  language: string;
}

const TEMPLATE_MAP: Record<TemplateId, React.ComponentType<Record<string, unknown>>> = {
  MinimalLuxury: MinimalLuxury as React.ComponentType<Record<string, unknown>>,
  BoldSale: BoldSale as React.ComponentType<Record<string, unknown>>,
  ProductShowcase: ProductShowcase as React.ComponentType<Record<string, unknown>>,
  StorySwipe: StorySwipe as React.ComponentType<Record<string, unknown>>,
  CleanModern: CleanModern as React.ComponentType<Record<string, unknown>>,
};

function getMusicUrl(trackId: string | null): string {
  if (!trackId) return "";
  return `/audio/${trackId}.mp3`;
}

export function VideoPreview({
  templateId,
  productData,
  script,
  colors,
  musicTrackId,
  language,
}: VideoPreviewProps) {
  const CompositionComponent = TEMPLATE_MAP[templateId];
  const fontConfig = getFontForLanguage(language);
  const rtl = isRtlLanguage(language);
  const musicUrl = getMusicUrl(musicTrackId);

  const inputProps = {
    productName: productData.name,
    images: productData.images,
    hook: script.hook,
    featureLines: script.featureLines,
    priceCallout: script.priceCallout,
    cta: script.cta,
    primaryColor: colors.primary,
    secondaryColor: colors.secondary,
    backgroundColor: colors.background,
    musicUrl,
    fontFamily: `${fontConfig.family}, ${fontConfig.fallback}`,
    rtl,
  };

  return (
    <Player
      component={CompositionComponent}
      inputProps={inputProps}
      durationInFrames={450}
      fps={30}
      compositionWidth={1080}
      compositionHeight={1920}
      style={{ width: "100%", maxHeight: "70vh" }}
      controls
      autoPlay={false}
    />
  );
}
