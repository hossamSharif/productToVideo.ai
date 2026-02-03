import type { ProductData } from "@/types";

interface JsonLdOffer {
  price?: string | number;
  lowPrice?: string | number;
  priceCurrency?: string;
}

interface JsonLdProduct {
  "@type"?: string;
  name?: string;
  description?: string;
  image?: string | string[] | { url?: string }[] | { url?: string };
  offers?:
    | JsonLdOffer
    | JsonLdOffer[]
    | { "@type"?: string; offers?: JsonLdOffer[] } & JsonLdOffer;
}

interface JsonLdGraph {
  "@graph"?: JsonLdProduct[];
}

/**
 * Extract image URLs from the JSON-LD image field, which can be
 * a string, an array of strings, an ImageObject, or an array of ImageObjects.
 */
function extractImages(
  image: JsonLdProduct["image"]
): string[] {
  if (!image) return [];

  if (typeof image === "string") {
    return [image];
  }

  if (Array.isArray(image)) {
    return image
      .map((img) => (typeof img === "string" ? img : img?.url ?? null))
      .filter((url): url is string => typeof url === "string" && url.length > 0);
  }

  // Single ImageObject
  if (typeof image === "object" && "url" in image && typeof image.url === "string") {
    return [image.url];
  }

  return [];
}

/**
 * Extract price and currency from the offers field.
 * Handles single offer, array of offers, and AggregateOffer with nested offers.
 */
function extractPriceInfo(
  offers: JsonLdProduct["offers"]
): { price: number; currency: string } | null {
  if (!offers) return null;

  // Normalize to a single offer to read from
  let offer: JsonLdOffer | undefined;

  if (Array.isArray(offers)) {
    offer = offers[0];
  } else if (
    typeof offers === "object" &&
    "offers" in offers &&
    Array.isArray(offers.offers)
  ) {
    // AggregateOffer with nested offers array
    offer = offers.offers[0];
    // Fall back to lowPrice on the aggregate itself if nested offers lack price
    if (!offer?.price && !offer?.lowPrice) {
      offer = offers as JsonLdOffer;
    }
  } else {
    offer = offers as JsonLdOffer;
  }

  if (!offer) return null;

  const rawPrice = offer.price ?? offer.lowPrice;
  if (rawPrice == null) return null;

  const price = typeof rawPrice === "string" ? parseFloat(rawPrice) : rawPrice;
  if (isNaN(price)) return null;

  const currency = offer.priceCurrency ?? "";

  return { price, currency };
}

/**
 * Find a Product node inside a parsed JSON-LD object.
 * Handles plain objects, arrays, and @graph wrappers.
 */
function findProduct(
  data: unknown
): JsonLdProduct | null {
  if (!data || typeof data !== "object") return null;

  // Direct product
  if ("@type" in (data as Record<string, unknown>)) {
    const typed = data as JsonLdProduct;
    if (typed["@type"] === "Product") return typed;
  }

  // @graph wrapper
  if ("@graph" in (data as Record<string, unknown>)) {
    const graph = (data as JsonLdGraph)["@graph"];
    if (Array.isArray(graph)) {
      for (const node of graph) {
        if (node?.["@type"] === "Product") return node;
      }
    }
  }

  // Top-level array
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findProduct(item);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Parse JSON-LD structured data from raw HTML and extract product information.
 * Returns null if no Product schema is found.
 */
export function parseJsonLd(html: string): Partial<ProductData> | null {
  // Match all <script type="application/ld+json"> blocks
  const scriptRegex =
    /<script[^>]+type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  let match: RegExpExecArray | null;
  while ((match = scriptRegex.exec(html)) !== null) {
    const raw = match[1].trim();
    if (!raw) continue;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Malformed JSON — skip this block
      continue;
    }

    const product = findProduct(parsed);
    if (!product) continue;

    const result: Partial<ProductData> = {};

    if (product.name) {
      result.name = product.name.trim();
    }
    if (product.description) {
      result.description = product.description.trim();
    }

    const images = extractImages(product.image);
    if (images.length > 0) {
      result.images = images;
    }

    const priceInfo = extractPriceInfo(product.offers);
    if (priceInfo) {
      result.price = priceInfo.price;
      if (priceInfo.currency) {
        result.currency = priceInfo.currency;
      }
    }

    return result;
  }

  return null;
}
