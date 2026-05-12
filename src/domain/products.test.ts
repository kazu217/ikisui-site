import { describe, expect, it } from "vitest";
import {
  createAffiliateProduct,
  parseAmazonProductInput,
  readTrackingIdFromUrl,
  upsertAffiliateProduct
} from "./products";

describe("affiliate product helpers", () => {
  it("extracts ASIN and tracking ID from Amazon affiliate URLs", () => {
    const parsed = parseAmazonProductInput(
      "https://www.amazon.co.jp/example/dp/B0ABCDEF12?tag=sample-22"
    );

    expect(parsed).toEqual({
      asin: "B0ABCDEF12",
      trackingIdFromUrl: "sample-22"
    });
  });

  it("reads a tracking tag from URL query parameters", () => {
    expect(
      readTrackingIdFromUrl("https://www.amazon.co.jp/dp/B0ABCDEF12?tag=abc-22")
    ).toBe("abc-22");
  });

  it("creates a direct Amazon affiliate product entry", () => {
    const product = createAffiliateProduct({
      sourceUrl: "https://www.amazon.co.jp/dp/B0ABCDEF12?tag=urltag-22",
      trackingId: "fallback-22",
      title: "テスト商品",
      category: "ゲーム",
      description: "手入力メモ",
      imageUrl: "",
      badge: "おすすめ",
      featured: true
    });

    expect(product.asin).toBe("B0ABCDEF12");
    expect(product.affiliateUrl).toBe(
      "https://www.amazon.co.jp/dp/B0ABCDEF12?tag=urltag-22"
    );
    expect(product.title).toBe("テスト商品");
  });

  it("upserts by ASIN without duplicating products", () => {
    const first = createAffiliateProduct({
      sourceUrl: "B0ABCDEF12",
      trackingId: "sample-22",
      title: "古いタイトル",
      category: "ゲーム",
      description: "",
      imageUrl: "",
      badge: "",
      featured: false
    });
    const next = createAffiliateProduct({
      sourceUrl: "B0ABCDEF12",
      trackingId: "sample-22",
      title: "新しいタイトル",
      category: "ゲーム",
      description: "",
      imageUrl: "",
      badge: "",
      featured: true
    });

    expect(upsertAffiliateProduct([first], next)).toHaveLength(1);
    expect(upsertAffiliateProduct([first], next)[0].title).toBe("新しいタイトル");
  });
});
