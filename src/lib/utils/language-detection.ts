import { franc } from "franc";

export const SUPPORTED_LANGUAGES: Record<string, string> = {
  eng: "English",
  ara: "Arabic",
  fra: "French",
  spa: "Spanish",
  deu: "German",
  tur: "Turkish",
  zho: "Chinese",
  hin: "Hindi",
};

const HTML_LANG_TO_ISO639_3: Record<string, string> = {
  en: "eng",
  ar: "ara",
  fr: "fra",
  es: "spa",
  de: "deu",
  tr: "tur",
  zh: "zho",
  hi: "hin",
};

export function detectLanguage(text: string, htmlLang?: string): string {
  // Fast-path: use htmlLang if provided and mappable
  if (htmlLang) {
    const normalized = htmlLang.trim().toLowerCase().split("-")[0];
    const mapped = HTML_LANG_TO_ISO639_3[normalized];
    if (mapped) {
      return mapped;
    }
  }

  // Use franc for text-based detection
  const detected = franc(text);

  if (detected === "und" || !(detected in SUPPORTED_LANGUAGES)) {
    return "eng";
  }

  return detected;
}
