interface FontConfig {
  family: string;
  fallback: string;
}

const LANGUAGE_FONT_MAP: Record<string, FontConfig> = {
  eng: { family: "Inter", fallback: "sans-serif" },
  fra: { family: "Inter", fallback: "sans-serif" },
  spa: { family: "Inter", fallback: "sans-serif" },
  deu: { family: "Inter", fallback: "sans-serif" },
  tur: { family: "Inter", fallback: "sans-serif" },
  ara: { family: "Noto Sans Arabic", fallback: "sans-serif" },
  zho: { family: "Noto Sans SC", fallback: "sans-serif" },
  hin: { family: "Noto Sans Devanagari", fallback: "sans-serif" },
};

const DEFAULT_FONT: FontConfig = { family: "Inter", fallback: "sans-serif" };

const RTL_LANGUAGES = new Set(["ara"]);

export function getFontForLanguage(languageCode: string): FontConfig {
  return LANGUAGE_FONT_MAP[languageCode] ?? DEFAULT_FONT;
}

export function isRtlLanguage(languageCode: string): boolean {
  return RTL_LANGUAGES.has(languageCode);
}
