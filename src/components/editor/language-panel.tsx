"use client";

import { useTranslations } from "next-intl";
import { Globe, AlertCircle } from "lucide-react";

interface LanguagePanelProps {
  language: string;
  onLanguageChange: (language: string) => void;
}

const SUPPORTED_LANGUAGES: { code: string; label: string }[] = [
  { code: "eng", label: "English" },
  { code: "ara", label: "Arabic (\u0627\u0644\u0639\u0631\u0628\u064A\u0629)" },
  { code: "fra", label: "French (Fran\u00E7ais)" },
  { code: "spa", label: "Spanish (Espa\u00F1ol)" },
  { code: "deu", label: "German (Deutsch)" },
  { code: "tur", label: "Turkish (T\u00FCrk\u00E7e)" },
  { code: "zho", label: "Chinese (\u4E2D\u6587)" },
  { code: "hin", label: "Hindi (\u0939\u093F\u0928\u094D\u0926\u0940)" },
];

export function LanguagePanel({
  language,
  onLanguageChange,
}: LanguagePanelProps) {
  const t = useTranslations("editor");

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium">{t("customize.language")}</label>

      <div className="flex flex-col gap-1">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = language === lang.code;

          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => onLanguageChange(lang.code)}
              className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 text-left transition-colors hover:bg-accent ${
                isSelected
                  ? "border-ring ring-ring/50 ring-[2px]"
                  : "border-input"
              }`}
            >
              <Globe className="size-4 text-muted-foreground shrink-0" />
              <span className="text-sm">{lang.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-start gap-2 rounded-md bg-muted px-3 py-2">
        <AlertCircle className="size-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-muted-foreground text-xs">
          {t("customize.languageChangeNote")}
        </p>
      </div>
    </div>
  );
}
