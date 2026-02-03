import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

import type { ProductData } from "@/types";
import { parseJsonLd } from "./json-ld";
import { parseOpenGraph } from "./og-parser";
import { platforms } from "./platform-selectors";
import { detectLanguage } from "@/lib/utils/language-detection";

// ---------------------------------------------------------------------------
// Custom error class
// ---------------------------------------------------------------------------

export class ExtractionError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "ExtractionError";
    this.code = code;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const LANG_ATTR_RE = /<html[^>]*lang=["']([^"']+)["']/i;

/**
 * Validate that a string is a well-formed HTTP(S) URL.
 */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Extract the html lang attribute from raw HTML.
 */
function extractHtmlLang(html: string): string | undefined {
  const match = LANG_ATTR_RE.exec(html);
  return match?.[1] ?? undefined;
}

/**
 * Generic DOM-style extraction using regex on raw HTML.
 * Extracts h1, itemprop="price", and meta description as a fallback layer.
 */
function extractGeneric(html: string): Partial<ProductData> {
  const result: Partial<ProductData> = {};

  // h1 for name
  const h1Match = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
  if (h1Match?.[1]) {
    const text = h1Match[1].replace(/<[^>]*>/g, "").trim();
    if (text) result.name = text;
  }

  // itemprop="price" for price
  const priceMatch =
    /itemprop\s*=\s*["']price["'][^>]*content\s*=\s*["']([^"']+)["']/i.exec(html) ??
    /content\s*=\s*["']([^"']+)["'][^>]*itemprop\s*=\s*["']price["']/i.exec(html);
  if (priceMatch?.[1]) {
    const parsed = parseFloat(priceMatch[1]);
    if (!isNaN(parsed)) result.price = parsed;
  }

  // itemprop="priceCurrency" for currency
  const currencyMatch =
    /itemprop\s*=\s*["']priceCurrency["'][^>]*content\s*=\s*["']([^"']+)["']/i.exec(html) ??
    /content\s*=\s*["']([^"']+)["'][^>]*itemprop\s*=\s*["']priceCurrency["']/i.exec(html);
  if (currencyMatch?.[1]) {
    result.currency = currencyMatch[1].trim().toUpperCase();
  }

  // meta description
  const descMatch =
    /<meta[^>]+name\s*=\s*["']description["'][^>]+content\s*=\s*["']([^"']*)["']/i.exec(html) ??
    /<meta[^>]+content\s*=\s*["']([^"']*)["'][^>]+name\s*=\s*["']description["']/i.exec(html);
  if (descMatch?.[1]) {
    const text = descMatch[1].trim();
    if (text) result.description = text;
  }

  return result;
}

/**
 * Merge multiple partial ProductData objects. Earlier sources win per field.
 */
function mergePartials(...sources: (Partial<ProductData> | null)[]): Partial<ProductData> {
  const merged: Partial<ProductData> = {};

  for (const source of sources) {
    if (!source) continue;

    if (!merged.name && source.name) merged.name = source.name;
    if (!merged.description && source.description) merged.description = source.description;
    if (merged.price == null && source.price != null) merged.price = source.price;
    if (!merged.currency && source.currency) merged.currency = source.currency;
    if ((!merged.images || merged.images.length === 0) && source.images && source.images.length > 0) {
      merged.images = source.images;
    }
    if (!merged.source_platform && source.source_platform) {
      merged.source_platform = source.source_platform;
    }
    if (!merged.extraction_method && source.extraction_method) {
      merged.extraction_method = source.extraction_method;
    }
  }

  return merged;
}

/**
 * Check whether the partial data has at least name and price (considered "enough").
 */
function hasEnoughData(data: Partial<ProductData>): boolean {
  return Boolean(data.name && data.price != null);
}

// ---------------------------------------------------------------------------
// Browser helpers
// ---------------------------------------------------------------------------

async function getExecutablePath(): Promise<string> {
  if (process.env.NODE_ENV !== "production") {
    // Local dev: use puppeteer's bundled Chromium
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const localPuppeteer = require("puppeteer");
    return localPuppeteer.executablePath();
  }
  return await chromium.executablePath(process.env.CHROMIUM_REMOTE_URL);
}

async function fetchWithBrowser(url: string): Promise<string> {
  const executablePath = await getExecutablePath();

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: true,
  });

  try {
    const page = await browser.newPage();

    // Block heavy resources to speed up loading
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const resourceType = req.resourceType();
      if (
        resourceType === "image" ||
        resourceType === "font" ||
        resourceType === "stylesheet"
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    const html = await page.content();
    return html;
  } finally {
    await browser.close();
  }
}

// ---------------------------------------------------------------------------
// Main orchestrator
// ---------------------------------------------------------------------------

export async function extractProduct(url: string): Promise<ProductData> {
  // 1. Validate URL
  if (!isValidUrl(url)) {
    throw new ExtractionError(`Invalid URL: ${url}`, "INVALID_URL");
  }

  let html = "";
  let htmlLang: string | undefined;
  let platformMatch = platforms.find((p) => p.detect(url, ""));

  // 2. Try light fetch first (no browser)
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      html = await res.text();
      htmlLang = extractHtmlLang(html);

      // Re-detect platform with actual HTML
      if (!platformMatch) {
        platformMatch = platforms.find((p) => p.detect(url, html));
      }

      // Try platform-specific extraction (Shopify .json trick runs inside its extract)
      let platformData: Partial<ProductData> | null = null;
      if (platformMatch) {
        platformData = await platformMatch.extract(url, html);
        if (platformData && Object.keys(platformData).length > 0) {
          platformData.extraction_method = "platform-specific";
        }
      }

      // Try JSON-LD
      const jsonLdData = parseJsonLd(html);
      if (jsonLdData) {
        jsonLdData.extraction_method = "json-ld";
      }

      // If we have enough from light fetch, skip browser
      const lightMerge = mergePartials(platformData, jsonLdData);
      if (hasEnoughData(lightMerge)) {
        // Also pull OG and generic for supplementary fields
        const ogData = parseOpenGraph(html);
        const genericData = extractGeneric(html);
        const merged = mergePartials(platformData, jsonLdData, ogData, genericData);

        return finalize(merged, html, htmlLang, platformMatch?.name);
      }
    }
  } catch (err) {
    // Light fetch failed — we'll try the browser next.
    // If it was a timeout on just the fetch, that's fine.
    if (err instanceof ExtractionError) throw err;
  }

  // 3. Launch browser for full rendering
  try {
    html = await fetchWithBrowser(url);
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      (err.message.includes("timeout") ||
        err.message.includes("Timeout") ||
        err.name === "TimeoutError")
    ) {
      throw new ExtractionError(
        `Timed out loading ${url}`,
        "TIMEOUT"
      );
    }
    throw new ExtractionError(
      `Failed to load ${url}: ${err instanceof Error ? err.message : String(err)}`,
      "NO_PRODUCT_DATA"
    );
  }

  htmlLang = extractHtmlLang(html);

  // Re-detect platform with browser HTML
  if (!platformMatch) {
    platformMatch = platforms.find((p) => p.detect(url, html));
  }

  // 4. Layered extraction on browser HTML
  let platformData: Partial<ProductData> | null = null;
  if (platformMatch) {
    platformData = await platformMatch.extract(url, html);
    if (platformData && Object.keys(platformData).length > 0) {
      platformData.extraction_method = "platform-specific";
    }
  }

  const jsonLdData = parseJsonLd(html);
  if (jsonLdData) {
    jsonLdData.extraction_method = "json-ld";
  }

  const ogData = parseOpenGraph(html);
  if (ogData) {
    ogData.extraction_method = "open-graph";
  }

  const genericData = extractGeneric(html);
  if (Object.keys(genericData).length > 0) {
    genericData.extraction_method = "generic";
  }

  // 5. Merge: platform > JSON-LD > OG > generic
  const merged = mergePartials(platformData, jsonLdData, ogData, genericData);

  return finalize(merged, html, htmlLang, platformMatch?.name);
}

// ---------------------------------------------------------------------------
// Finalize: fill defaults, detect language, validate
// ---------------------------------------------------------------------------

function finalize(
  data: Partial<ProductData>,
  html: string,
  htmlLang: string | undefined,
  platformName: string | undefined
): ProductData {
  if (!data.name) {
    throw new ExtractionError(
      "Could not extract product data from the page",
      "NO_PRODUCT_DATA"
    );
  }

  const textForLang = [data.name, data.description].filter(Boolean).join(" ");
  const language = detectLanguage(textForLang, htmlLang);

  return {
    name: data.name,
    description: data.description ?? "",
    price: data.price ?? 0,
    currency: data.currency ?? "USD",
    images: data.images ?? [],
    language,
    source_platform: data.source_platform ?? platformName ?? "generic",
    extraction_method: data.extraction_method ?? "generic",
  };
}
