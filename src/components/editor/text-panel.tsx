"use client";

import { useTranslations } from "next-intl";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import type { VideoScript } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface TextPanelProps {
  script: VideoScript;
  onScriptChange: (script: VideoScript) => void;
  onRegenerate: () => void;
  isRegenerating?: boolean;
}

export function TextPanel({
  script,
  onScriptChange,
  onRegenerate,
  isRegenerating = false,
}: TextPanelProps) {
  const t = useTranslations("editor");

  function handleFieldChange(field: keyof VideoScript, value: string) {
    onScriptChange({ ...script, [field]: value });
  }

  function handleFeatureLineChange(index: number, value: string) {
    const updated = [...script.featureLines];
    updated[index] = value;
    onScriptChange({ ...script, featureLines: updated });
  }

  function handleAddFeatureLine() {
    onScriptChange({
      ...script,
      featureLines: [...script.featureLines, ""],
    });
  }

  function handleRemoveFeatureLine(index: number) {
    const updated = script.featureLines.filter((_, i) => i !== index);
    onScriptChange({ ...script, featureLines: updated });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">{t("customize.hook")}</label>
        <Input
          value={script.hook}
          onChange={(e) => handleFieldChange("hook", e.target.value)}
          placeholder={t("customize.hook")}
        />
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            {t("customize.features")}
          </label>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleAddFeatureLine}
          >
            <Plus />
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {script.featureLines.map((line, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs w-5 shrink-0 text-center">
                {index + 1}
              </span>
              <Input
                value={line}
                onChange={(e) =>
                  handleFeatureLineChange(index, e.target.value)
                }
                placeholder={`${t("customize.features")} ${index + 1}`}
              />
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => handleRemoveFeatureLine(index)}
                disabled={script.featureLines.length <= 1}
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">
          {t("customize.priceCallout")}
        </label>
        <Input
          value={script.priceCallout}
          onChange={(e) => handleFieldChange("priceCallout", e.target.value)}
          placeholder={t("customize.priceCallout")}
        />
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">{t("customize.cta")}</label>
        <Input
          value={script.cta}
          onChange={(e) => handleFieldChange("cta", e.target.value)}
          placeholder={t("customize.cta")}
        />
      </div>

      <Separator />

      <Button onClick={onRegenerate} disabled={isRegenerating}>
        <RefreshCw className={isRegenerating ? "animate-spin" : ""} />
        {t("customize.regenerateScript")}
      </Button>
    </div>
  );
}
