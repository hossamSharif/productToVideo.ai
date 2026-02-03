import type { ProductData } from "@/types";
import { parseJsonLd } from "./json-ld";

export type PlatformConfig = {
  name: string;
  detect: (url: string, html: string) => boolean;
  extract: (url: string, html: string) => Promise<Partial<ProductData>>;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract text content from an HTML element matched by a regex.
 * Strips inner HTML tags and decodes common HTML entities.
 */
function extractText(html: string, pattern: RegExp): string | null {
  const match = pattern.exec(html);
  if (!match?.[1]) return null;
  return decodeEntities(match[1].replace(/<[^>]*>/g, "").trim());
}

/**
 * Decode common HTML entities.
 */
function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

/**
 * Extract the first image src from an element matched by a regex that
 * captures the inner content of the element containing <img> tags.
 */
function extractImgSrc(html: string, pattern: RegExp): string | null {
  const container = pattern.exec(html);
  if (!container?.[0]) return null;
  const imgMatch = /src\s*=\s*["']([^"']+)["']/i.exec(container[0]);
  return imgMatch?.[1] ?? null;
}

/**
 * Build a result from JSON-LD, returning an empty object if nothing found.
 */
function jsonLdOrEmpty(html: string): Partial<ProductData> {
  return parseJsonLd(html) ?? {};
}

// ---------------------------------------------------------------------------
// Platform Configurations
// ---------------------------------------------------------------------------

const shopify: PlatformConfig = {
  name: "shopify",
  detect: (url, html) =>
    url.includes("myshopify.com") ||
    /Shopify\.theme/i.test(html) ||
    /<meta[^>]+name=["']shopify/i.test(html),
  extract: async (url, _html) => {
    // Shopify exposes product data at <product-url>.json
    try {
      // Strip query params / hash, append .json
      const cleanUrl = url.split("?")[0].split("#")[0].replace(/\/+$/, "");
      const jsonUrl = cleanUrl + ".json";
      const res = await fetch(jsonUrl, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return {};

      const data = (await res.json()) as {
        product?: {
          title?: string;
          body_html?: string;
          images?: { src: string }[];
          variants?: { price?: string }[];
        };
      };

      const product = data?.product;
      if (!product) return {};

      const result: Partial<ProductData> = {};
      if (product.title) result.name = product.title;
      if (product.body_html) {
        result.description = product.body_html
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      }

      const images = product.images
        ?.map((img) => img.src)
        .filter(Boolean);
      if (images && images.length > 0) result.images = images;

      const firstPrice = product.variants?.[0]?.price;
      if (firstPrice) {
        const parsed = parseFloat(firstPrice);
        if (!isNaN(parsed)) result.price = parsed;
      }

      result.source_platform = "shopify";
      return result;
    } catch {
      return {};
    }
  },
};

const wooCommerce: PlatformConfig = {
  name: "woocommerce",
  detect: (_url, html) =>
    /class\s*=\s*["'][^"']*woocommerce/i.test(html) ||
    /class\s*=\s*["'][^"']*wc-/i.test(html) ||
    /woocommerce/i.test(html),
  extract: async (_url, html) => {
    const result: Partial<ProductData> = {};

    // Product title
    const title = extractText(
      html,
      /<[^>]+class\s*=\s*["'][^"']*product_title[^"']*["'][^>]*>([\s\S]*?)<\//i
    );
    if (title) result.name = title;

    // Price — look for .woocommerce-Price-amount inside .price
    const priceText = extractText(
      html,
      /class\s*=\s*["'][^"']*woocommerce-Price-amount[^"']*["'][^>]*>([\s\S]*?)<\//i
    );
    if (priceText) {
      const numericStr = priceText.replace(/[^\d.,]/g, "").replace(",", ".");
      const parsed = parseFloat(numericStr);
      if (!isNaN(parsed)) result.price = parsed;
    }

    // Currency symbol
    const currencyMatch =
      /class\s*=\s*["'][^"']*woocommerce-Price-currencySymbol[^"']*["'][^>]*>([\s\S]*?)<\//i.exec(
        html
      );
    if (currencyMatch?.[1]) {
      result.currency = decodeEntities(currencyMatch[1].trim());
    }

    // Description from short description or full description
    const desc = extractText(
      html,
      /<div[^>]+class\s*=\s*["'][^"']*woocommerce-product-details__short-description[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
    );
    if (desc) result.description = desc;

    // Main product image
    const img = extractImgSrc(
      html,
      /<div[^>]+class\s*=\s*["'][^"']*woocommerce-product-gallery__image[^"']*["'][^>]*>[\s\S]*?<\/div>/i
    );
    if (img) result.images = [img];

    result.source_platform = "woocommerce";
    return result;
  },
};

const amazon: PlatformConfig = {
  name: "amazon",
  detect: (url) => /amazon\.\w+\/.*\/dp\//i.test(url) || /amazon\.\w+\/dp\//i.test(url),
  extract: async (_url, html) => {
    const result: Partial<ProductData> = {};

    // Product title
    const title = extractText(
      html,
      /<span[^>]+id\s*=\s*["']productTitle["'][^>]*>([\s\S]*?)<\/span>/i
    );
    if (title) result.name = title;

    // Price — .a-offscreen inside .a-price
    const priceText = extractText(
      html,
      /class\s*=\s*["']a-price[\s"'][^>]*>[\s\S]*?class\s*=\s*["']a-offscreen["'][^>]*>([\s\S]*?)<\/span>/i
    );
    if (priceText) {
      const numericStr = priceText.replace(/[^\d.,]/g, "").replace(",", ".");
      const parsed = parseFloat(numericStr);
      if (!isNaN(parsed)) result.price = parsed;
    }

    // Landing image
    const imgMatch =
      /id\s*=\s*["']landingImage["'][^>]*src\s*=\s*["']([^"']+)["']/i.exec(html);
    if (imgMatch?.[1]) {
      result.images = [imgMatch[1]];
    }

    // Feature bullets as description
    const bullets: string[] = [];
    const bulletRegex =
      /<span\s+class\s*=\s*["']a-list-item["'][^>]*>([\s\S]*?)<\/span>/gi;
    let bulletMatch: RegExpExecArray | null;
    while ((bulletMatch = bulletRegex.exec(html)) !== null) {
      const text = bulletMatch[1].replace(/<[^>]*>/g, "").trim();
      if (text.length > 10 && text.length < 500) {
        bullets.push(text);
      }
      if (bullets.length >= 5) break;
    }
    if (bullets.length > 0) {
      result.description = bullets.join(". ");
    }

    result.source_platform = "amazon";
    return result;
  },
};

const salla: PlatformConfig = {
  name: "salla",
  detect: (url) => /salla\.sa/i.test(url),
  extract: async (_url, html) => {
    const result = jsonLdOrEmpty(html);
    result.source_platform = "salla";
    return result;
  },
};

const zid: PlatformConfig = {
  name: "zid",
  detect: (url) => /zid\.store/i.test(url),
  extract: async (_url, html) => {
    const result = jsonLdOrEmpty(html);
    result.source_platform = "zid";
    return result;
  },
};

const etsy: PlatformConfig = {
  name: "etsy",
  detect: (url) => /etsy\.com/i.test(url),
  extract: async (_url, html) => {
    const result: Partial<ProductData> = {};

    // Title — often in h1 or specific data attribute
    const title = extractText(
      html,
      /<h1[^>]*data-buy-box-listing-title[^>]*>([\s\S]*?)<\/h1>/i
    ) ?? extractText(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (title) result.name = title;

    // Price
    const priceText = extractText(
      html,
      /class\s*=\s*["'][^"']*wt-text-title-03[^"']*["'][^>]*>([\s\S]*?)<\//i
    );
    if (priceText) {
      const numericStr = priceText.replace(/[^\d.,]/g, "").replace(",", ".");
      const parsed = parseFloat(numericStr);
      if (!isNaN(parsed)) result.price = parsed;
    }

    // Description
    const desc = extractText(
      html,
      /<p[^>]+data-product-details-description-text-content[^>]*>([\s\S]*?)<\/p>/i
    );
    if (desc) result.description = desc;

    // Image from og or listing image
    const imgMatch =
      /class\s*=\s*["'][^"']*listing-page-image[^"']*["'][^>]*src\s*=\s*["']([^"']+)["']/i.exec(
        html
      );
    if (imgMatch?.[1]) result.images = [imgMatch[1]];

    // Fallback to JSON-LD if we got nothing useful
    if (!result.name && !result.price) {
      const ld = parseJsonLd(html);
      if (ld) Object.assign(result, ld);
    }

    result.source_platform = "etsy";
    return result;
  },
};

const noon: PlatformConfig = {
  name: "noon",
  detect: (url) => /noon\.com/i.test(url),
  extract: async (_url, html) => {
    const result = jsonLdOrEmpty(html);
    result.source_platform = "noon";
    return result;
  },
};

const wix: PlatformConfig = {
  name: "wix",
  detect: (_url, html) =>
    /<meta[^>]+name=["']generator["'][^>]*content=["'][^"']*Wix/i.test(html) ||
    /X-Wix-/i.test(html),
  extract: async (_url, html) => {
    const result = jsonLdOrEmpty(html);
    result.source_platform = "wix";
    return result;
  },
};

const squarespace: PlatformConfig = {
  name: "squarespace",
  detect: (_url, html) =>
    /<meta[^>]+name=["']generator["'][^>]*content=["'][^"']*Squarespace/i.test(html) ||
    /squarespace/i.test(html),
  extract: async (_url, html) => {
    const result = jsonLdOrEmpty(html);
    result.source_platform = "squarespace";
    return result;
  },
};

const bigCommerce: PlatformConfig = {
  name: "bigcommerce",
  detect: (_url, html) =>
    /<meta[^>]+name=["']platform["'][^>]*content=["'][^"']*BigCommerce/i.test(html) ||
    /BigCommerce/i.test(html),
  extract: async (_url, html) => {
    const result = jsonLdOrEmpty(html);
    result.source_platform = "bigcommerce";
    return result;
  },
};

// ---------------------------------------------------------------------------
// Exported platforms array — order matters: more specific detections first
// ---------------------------------------------------------------------------

export const platforms: PlatformConfig[] = [
  shopify,
  wooCommerce,
  amazon,
  salla,
  zid,
  etsy,
  noon,
  wix,
  squarespace,
  bigCommerce,
];
