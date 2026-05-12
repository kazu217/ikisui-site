# 買い物応援リンク集 Notes

## Goal

Build a local MVP with two connected surfaces:

- A public affiliate product site named `買い物応援リンク集`.
- An admin app that accepts an Amazon.co.jp URL with an affiliate tag and adds the product to the site.

## Current Safe Scope

- Extract ASINs from Amazon.co.jp URLs.
- Preserve or generate direct Amazon Associates links with a tracking ID.
- Store products locally in the browser for the MVP.
- Let the admin enter title, category, image URL, short description, and badges manually.
- Show an affiliate disclosure on the public site.

## Compliance Guardrails

- Do not scrape Amazon pages.
- Do not use headless browser polling for product information.
- Do not claim live Amazon price, stock, discount, or urgency unless it came from approved Amazon API access.
- Keep Amazon affiliate links direct; do not cloak or redirect them.
- Treat any product image URL or title as manually supplied unless official API access is added later.

## Implementation Plan

1. Use the `amazon2` Vite/React/TypeScript setup as a read-only reference.
2. Create the `amazon3` app files only inside `/Users/uri/claude/amazon3`.
3. Implement a public storefront view and an admin add-product view.
4. Add domain helpers and tests for ASIN extraction, affiliate link generation, and product creation.
5. Run lint, typecheck, tests, build, and start a local dev server.

## Future Backend Path

To make additions update a deployed public site for all visitors, replace localStorage with a server-backed store:

- Cloudflare Workers API.
- Cloudflare D1 table for products.
- Admin authentication before public deployment.
- Official Amazon API integration for product titles/images if access is approved.
