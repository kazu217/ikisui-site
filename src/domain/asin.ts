const ASIN_PATTERN = /^[A-Z0-9]{10}$/;
const AMAZON_HOST_PATTERN = /(^|\.)amazon\.co\.jp$/i;

export function isValidAsin(value: string): boolean {
  return ASIN_PATTERN.test(value.trim().toUpperCase());
}

export function extractAsinFromAmazonUrl(input: string): string | null {
  let url: URL;

  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }

  if (!AMAZON_HOST_PATTERN.test(url.hostname)) {
    return null;
  }

  const pathParts = url.pathname
    .split("/")
    .map((part) => part.trim().toUpperCase())
    .filter(Boolean);

  const markerIndexes = pathParts.flatMap((part, index) =>
    ["DP", "PRODUCT", "ASIN", "O"].includes(part) ? [index] : []
  );

  for (const markerIndex of markerIndexes) {
    const candidate = pathParts[markerIndex + 1];
    if (candidate && isValidAsin(candidate)) {
      return candidate;
    }
  }

  const fallback = pathParts.find(isValidAsin);
  return fallback ?? null;
}

