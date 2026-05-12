import { describe, expect, it } from "vitest";
import { extractAsinFromAmazonUrl, isValidAsin } from "./asin";

describe("ASIN utilities", () => {
  it("validates ASIN shape", () => {
    expect(isValidAsin("B0ABCDEF12")).toBe(true);
    expect(isValidAsin("too-short")).toBe(false);
  });

  it("extracts ASIN from common Amazon.co.jp URL formats", () => {
    expect(
      extractAsinFromAmazonUrl("https://www.amazon.co.jp/dp/B0ABCDEF12")
    ).toBe("B0ABCDEF12");
    expect(
      extractAsinFromAmazonUrl(
        "https://www.amazon.co.jp/gp/product/B012345678?tag=test-22"
      )
    ).toBe("B012345678");
    expect(
      extractAsinFromAmazonUrl(
        "https://www.amazon.co.jp/some-title/dp/B0ZZZZZZZZ/ref=sr_1_1"
      )
    ).toBe("B0ZZZZZZZZ");
  });

  it("rejects non-Amazon URLs", () => {
    expect(extractAsinFromAmazonUrl("https://example.com/dp/B0ABCDEF12")).toBe(
      null
    );
  });
});

