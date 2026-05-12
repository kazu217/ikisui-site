import { buildAffiliateUrl } from "./affiliate";
import { extractAsinFromAmazonUrl, isValidAsin } from "./asin";

export interface AffiliateProduct {
  id: string;
  asin: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  affiliateUrl: string;
  sourceUrl: string;
  badge: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDraft {
  sourceUrl: string;
  trackingId: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  badge: string;
  featured: boolean;
}

export interface ParsedAmazonUrl {
  asin: string;
  trackingIdFromUrl?: string;
}

export function readTrackingIdFromUrl(input: string): string | undefined {
  try {
    const url = new URL(input.trim());
    return url.searchParams.get("tag")?.trim() || undefined;
  } catch {
    return undefined;
  }
}

export function parseAmazonProductInput(input: string): ParsedAmazonUrl | null {
  const value = input.trim();
  const asin = isValidAsin(value) ? value.toUpperCase() : extractAsinFromAmazonUrl(value);

  if (!asin) {
    return null;
  }

  return {
    asin,
    trackingIdFromUrl: readTrackingIdFromUrl(value)
  };
}

export function createAffiliateProduct(draft: ProductDraft): AffiliateProduct {
  const parsed = parseAmazonProductInput(draft.sourceUrl);

  if (!parsed) {
    throw new Error("Amazon.co.jpの商品URLまたはASINを入力してください");
  }

  const trackingId = parsed.trackingIdFromUrl ?? draft.trackingId.trim();
  const now = new Date().toISOString();

  return {
    id: `product-${parsed.asin}`,
    asin: parsed.asin,
    title: draft.title.trim() || `Amazon商品 ${parsed.asin}`,
    category: draft.category.trim() || "未分類",
    description: draft.description.trim(),
    imageUrl: draft.imageUrl.trim(),
    affiliateUrl: buildAffiliateUrl(parsed.asin, trackingId),
    sourceUrl: draft.sourceUrl.trim(),
    badge: draft.badge.trim(),
    featured: draft.featured,
    createdAt: now,
    updatedAt: now
  };
}

export function upsertAffiliateProduct(
  products: AffiliateProduct[],
  product: AffiliateProduct
): AffiliateProduct[] {
  const existing = products.find((item) => item.asin === product.asin);

  if (!existing) {
    return [product, ...products];
  }

  return products.map((item) =>
    item.asin === product.asin
      ? {
          ...existing,
          ...product,
          createdAt: existing.createdAt,
          updatedAt: product.updatedAt
        }
      : item
  );
}
