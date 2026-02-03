"use client";

import { useTranslations } from "next-intl";
import type { ColorPalette } from "@/types";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface ColorsPanelProps {
  colors: ColorPalette;
  onColorsChange: (colors: ColorPalette) => void;
}

const PRESET_PALETTES: { name: string; colors: ColorPalette }[] = [
  {
    name: "Classic",
    colors: { primary: "#1a1a2e", secondary: "#e94560", background: "#0f3460" },
  },
  {
    name: "Fresh",
    colors: { primary: "#2d6a4f", secondary: "#95d5b2", background: "#d8f3dc" },
  },
  {
    name: "Bold",
    colors: { primary: "#e63946", secondary: "#f1faee", background: "#1d3557" },
  },
  {
    name: "Warm",
    colors: { primary: "#e07a5f", secondary: "#f4f1de", background: "#3d405b" },
  },
  {
    name: "Ocean",
    colors: { primary: "#023e8a", secondary: "#90e0ef", background: "#caf0f8" },
  },
  {
    name: "Sunset",
    colors: { primary: "#ff6b6b", secondary: "#ffd93d", background: "#6c5ce7" },
  },
];

export function ColorsPanel({ colors, onColorsChange }: ColorsPanelProps) {
  const t = useTranslations("editor");

  function handleColorChange(field: keyof ColorPalette, value: string) {
    onColorsChange({ ...colors, [field]: value });
  }

  function handleHexInputChange(field: keyof ColorPalette, value: string) {
    const hex = value.startsWith("#") ? value : `#${value}`;
    if (/^#[0-9a-fA-F]{0,6}$/.test(hex)) {
      onColorsChange({ ...colors, [field]: hex });
    }
  }

  const colorFields: { key: keyof ColorPalette; label: string }[] = [
    { key: "primary", label: t("customize.primaryColor") },
    { key: "secondary", label: t("customize.secondaryColor") },
    { key: "background", label: t("customize.backgroundColor") },
  ];

  return (
    <div className="flex flex-col gap-4">
      {colorFields.map(({ key, label }) => (
        <div key={key} className="flex flex-col gap-2">
          <label className="text-sm font-medium">{label}</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={colors[key]}
              onChange={(e) => handleColorChange(key, e.target.value)}
              className="h-9 w-12 cursor-pointer rounded-md border border-input bg-transparent p-0.5"
            />
            <Input
              value={colors[key]}
              onChange={(e) => handleHexInputChange(key, e.target.value)}
              className="font-mono"
              maxLength={7}
            />
          </div>
        </div>
      ))}

      <Separator />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">
          {t("customize.presetPalettes")}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_PALETTES.map((preset) => {
            const isActive =
              colors.primary === preset.colors.primary &&
              colors.secondary === preset.colors.secondary &&
              colors.background === preset.colors.background;

            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => onColorsChange(preset.colors)}
                className={`flex items-center gap-2 rounded-md border px-3 py-2 transition-colors hover:bg-accent ${
                  isActive
                    ? "border-ring ring-ring/50 ring-[2px]"
                    : "border-input"
                }`}
              >
                <div className="flex gap-1">
                  <span
                    className="block h-5 w-5 rounded-full border border-border"
                    style={{ backgroundColor: preset.colors.primary }}
                  />
                  <span
                    className="block h-5 w-5 rounded-full border border-border"
                    style={{ backgroundColor: preset.colors.secondary }}
                  />
                  <span
                    className="block h-5 w-5 rounded-full border border-border"
                    style={{ backgroundColor: preset.colors.background }}
                  />
                </div>
                <span className="text-xs">{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
