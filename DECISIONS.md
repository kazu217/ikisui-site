# DECISIONS.md

## Decisions

### 2026-05-12: Build A Safe Affiliate Site MVP

The first version is a static-style React app with a public product list and an admin add-product screen.

### 2026-05-12: No Amazon Scraping

The app extracts ASINs from user-provided Amazon.co.jp URLs but does not fetch Amazon pages or product details.

### 2026-05-12: Store Products In Cloudflare KV

Products are saved in Cloudflare KV through a Worker API so admin changes automatically update the public site.

### 2026-05-12: Keep Affiliate Links Direct

Generated product links point directly to `https://www.amazon.co.jp/dp/{ASIN}?tag={trackingId}`.

## Open Questions

- What is the real Amazon Associates tracking ID?
- Should the production site be Cloudflare Pages/Workers, Vercel, Netlify, or another host?
- Should product data be managed through Cloudflare D1, a JSON file workflow, or a CMS?
- Do you already have official Amazon API access for product title/image lookup?
