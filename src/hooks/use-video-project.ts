"use client";

import { useState } from "react";
import type {
  ProductData,
  VideoScript,
  ColorPalette,
  TemplateId,
  VideoFormat,
} from "@/types";

export type VideoStep =
  | "url-input"
  | "data-review"
  | "template-select"
  | "editor"
  | "render";

interface VideoProjectState {
  step: VideoStep;
  url: string;
  productData: ProductData | null;
  script: VideoScript | null;
  templateId: TemplateId | null;
  colors: ColorPalette;
  musicTrackId: string | null;
  language: string;
  selectedFormats: VideoFormat[];
  isExtracting: boolean;
  isGeneratingScript: boolean;
  error: string | null;
}

const DEFAULT_COLORS: ColorPalette = {
  primary: "#1a1a2e",
  secondary: "#e94560",
  background: "#0f3460",
};

const DEFAULT_FORMATS: VideoFormat[] = ["9:16"];

const INITIAL_STATE: VideoProjectState = {
  step: "url-input",
  url: "",
  productData: null,
  script: null,
  templateId: null,
  colors: DEFAULT_COLORS,
  musicTrackId: null,
  language: "eng",
  selectedFormats: DEFAULT_FORMATS,
  isExtracting: false,
  isGeneratingScript: false,
  error: null,
};

export function useVideoProject() {
  const [state, setState] = useState<VideoProjectState>(INITIAL_STATE);

  function setUrl(url: string) {
    setState((prev) => ({ ...prev, url, error: null }));
  }

  async function extractProduct() {
    setState((prev) => ({ ...prev, isExtracting: true, error: null }));
    try {
      const response = await fetch("/api/extract-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: state.url }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error ?? `Extraction failed (${response.status})`
        );
      }
      const productData: ProductData = await response.json();
      setState((prev) => ({
        ...prev,
        productData,
        language: productData.language || prev.language,
        isExtracting: false,
        step: "data-review",
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isExtracting: false,
        error: err instanceof Error ? err.message : "Failed to extract product",
      }));
    }
  }

  async function generateScript() {
    setState((prev) => ({ ...prev, isGeneratingScript: true, error: null }));
    try {
      const response = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productData: state.productData,
          language: state.language,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error ?? `Script generation failed (${response.status})`
        );
      }
      const script: VideoScript = await response.json();
      setState((prev) => ({
        ...prev,
        script,
        isGeneratingScript: false,
        step: "template-select",
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isGeneratingScript: false,
        error:
          err instanceof Error ? err.message : "Failed to generate script",
      }));
    }
  }

  function selectTemplate(id: TemplateId) {
    setState((prev) => ({ ...prev, templateId: id, step: "editor" }));
  }

  function updateScript(script: VideoScript) {
    setState((prev) => ({ ...prev, script }));
  }

  function updateColors(colors: ColorPalette) {
    setState((prev) => ({ ...prev, colors }));
  }

  function setMusicTrack(id: string | null) {
    setState((prev) => ({ ...prev, musicTrackId: id }));
  }

  function setLanguage(lang: string) {
    setState((prev) => ({ ...prev, language: lang }));
  }

  function setFormats(formats: VideoFormat[]) {
    setState((prev) => ({ ...prev, selectedFormats: formats }));
  }

  function goToStep(step: VideoStep) {
    setState((prev) => ({ ...prev, step }));
  }

  async function startRender() {
    setState((prev) => ({ ...prev, error: null }));
    try {
      const response = await fetch("/api/render-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productData: state.productData,
          script: state.script,
          templateId: state.templateId,
          colors: state.colors,
          musicTrackId: state.musicTrackId,
          language: state.language,
          formats: state.selectedFormats,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error ?? `Render request failed (${response.status})`
        );
      }
      setState((prev) => ({ ...prev, step: "render" }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Failed to start render",
      }));
    }
  }

  function loadFromProject(project: {
    source_url: string;
    product_name: string;
    product_description: string | null;
    product_price: number | null;
    product_currency: string | null;
    product_images: string[];
    detected_language: string | null;
    script_hook: string | null;
    script_features: string[] | null;
    script_price_callout: string | null;
    script_cta: string | null;
    template_id: string | null;
    primary_color: string | null;
    secondary_color: string | null;
    background_color: string | null;
    music_track_id: string | null;
  }) {
    const productData: ProductData = {
      name: project.product_name,
      description: project.product_description ?? "",
      price: project.product_price ?? 0,
      currency: project.product_currency ?? "USD",
      images: project.product_images ?? [],
      language: project.detected_language ?? "eng",
      source_platform: "",
      extraction_method: "",
    };

    const script: VideoScript | null =
      project.script_hook
        ? {
            hook: project.script_hook,
            featureLines: project.script_features ?? [],
            priceCallout: project.script_price_callout ?? "",
            cta: project.script_cta ?? "",
          }
        : null;

    setState({
      step: script && project.template_id ? "editor" : script ? "template-select" : "data-review",
      url: project.source_url,
      productData,
      script,
      templateId: (project.template_id as TemplateId) ?? null,
      colors: {
        primary: project.primary_color ?? DEFAULT_COLORS.primary,
        secondary: project.secondary_color ?? DEFAULT_COLORS.secondary,
        background: project.background_color ?? DEFAULT_COLORS.background,
      },
      musicTrackId: project.music_track_id,
      language: project.detected_language ?? "eng",
      selectedFormats: DEFAULT_FORMATS,
      isExtracting: false,
      isGeneratingScript: false,
      error: null,
    });
  }

  function reset() {
    setState(INITIAL_STATE);
  }

  return {
    ...state,
    setUrl,
    extractProduct,
    generateScript,
    selectTemplate,
    updateScript,
    updateColors,
    setMusicTrack,
    setLanguage,
    setFormats,
    goToStep,
    startRender,
    loadFromProject,
    reset,
  };
}
