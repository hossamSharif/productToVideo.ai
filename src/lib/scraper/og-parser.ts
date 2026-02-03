import type { ProductData } from "@/types";

interface MetaTag {
  property: string;
  content: string;
}

/**
 * Extract meta tags from raw HTML.
 * Looks for <meta> tags with property or name attributes and their content values.
 */
function extractMetaTags(html: string): MetaTag[] {
  const tags: MetaTag[] = [];
  const metaRegex =
    /<meta\s+[^>]*?(?:property|name)\s*=\s*["']([^"']+)["'][^>]*?content\s*=\s*["']([^"']*)["'][^>]*?\/?>/gi;
  const metaRegexReversed =
    /<meta\s+[^>]*?content\s*=\s*["']([^"']*)["'][^>]*?(?:property|name)\s*=\s*["']([^"']+)["'][^>]*?\/?>/gi;

  let match: RegExpExecArray | null;

  // property/name first, then content
  while ((match = metaRegex.exec(html)) !== null) {
    tags.push({ property: match[1].toLowerCase(), content: match[2] });
  }

  // content first, then property/name (some sites order attributes differently)
  while ((match = metaRegexReversed.exec(html)) !== null) {
    const property = match[2].toLowerCase();
    const content = match[1];
    // Avoid duplicates
    if (!tags.some((t) => t.property === property && t.content === content)) {
      tags.push({ property, content });
    }
  }

  return tags;
}

/**
 * Parse Open Graph and product meta tags from raw HTML.
 * Returns null if no meaningful OG data is found.
 */
export function parseOpenGraph(html: string): Partial<ProductData> | null {
  const tags = extractMetaTags(html);
  if (tags.length === 0) return null;

  const result: Partial<ProductData> = {};
  const images: string[] = [];

  for (const tag of tags) {
    switch (tag.property) {
      case "og:title":
        if (!result.name && tag.content) {
          result.name = tag.content.trim();
        }
        break;

      case "og:description":
        if (!result.description && tag.content) {
          result.description = tag.content.trim();
        }
        break;

      case "og:image":
      case "og:image:url":
      case "og:image:secure_url":
        if (tag.content && !images.includes(tag.content)) {
          images.push(tag.content);
        }
        break;

      case "product:price:amount":
        if (result.price == null && tag.content) {
          const parsed = parseFloat(tag.content);
          if (!isNaN(parsed)) {
            result.price = parsed;
          }
        }
        break;

      case "product:price:currency":
        if (!result.currency && tag.content) {
          result.currency = tag.content.trim().toUpperCase();
        }
        break;

      default:
        break;
    }
  }

  if (images.length > 0) {
    result.images = images;
  }

  // Return null if we found nothing meaningful
  const hasData =
    result.name ||
    result.description ||
    (result.images && result.images.length > 0) ||
    result.price != null;

  return hasData ? result : null;
}
