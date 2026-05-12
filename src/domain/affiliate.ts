import { isValidAsin } from "./asin";

export function buildAffiliateUrl(asin: string, trackingId: string): string {
  const normalizedAsin = asin.trim().toUpperCase();
  const normalizedTrackingId = trackingId.trim();

  if (!isValidAsin(normalizedAsin)) {
    throw new Error("Invalid ASIN");
  }

  if (!normalizedTrackingId) {
    throw new Error("Tracking ID is required");
  }

  const url = new URL(`https://www.amazon.co.jp/dp/${normalizedAsin}`);
  url.searchParams.set("tag", normalizedTrackingId);
  return url.toString();
}

