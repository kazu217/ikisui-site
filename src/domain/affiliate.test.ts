import { describe, expect, it } from "vitest";
import { buildAffiliateUrl } from "./affiliate";

describe("buildAffiliateUrl", () => {
  it("builds transparent Amazon Associates links", () => {
    expect(buildAffiliateUrl("B0ABCDEF12", "example-22")).toBe(
      "https://www.amazon.co.jp/dp/B0ABCDEF12?tag=example-22"
    );
  });

  it("rejects invalid input", () => {
    expect(() => buildAffiliateUrl("bad", "example-22")).toThrow("Invalid ASIN");
    expect(() => buildAffiliateUrl("B0ABCDEF12", "")).toThrow(
      "Tracking ID is required"
    );
  });
});

