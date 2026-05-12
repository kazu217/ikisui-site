# AGENTS.md

## Project Goal

Build an Amazon.co.jp affiliate product site and a small admin app that can add products from Amazon product URLs.

## Current Scope

- Public product-list site.
- Admin product-add form.
- ASIN extraction from Amazon.co.jp URLs.
- Direct Amazon Associates link generation.
- Manual title, image URL, category, badge, and description entry.
- Cloudflare KV persistence through a Worker API.
- JSON export/import for backups.

## Compliance Guardrails

Agents working on this repo must not:

- Scrape Amazon product pages.
- Use headless browser polling to collect Amazon product data.
- Automate Amazon cart or checkout behavior.
- Add CAPTCHA solving, proxy rotation, fingerprint evasion, or bot bypass logic.
- Display live price, stock, discount, or urgency claims without approved official API data.
- Cloak or redirect affiliate links.
- Commit credentials.

## Production Notes

- Add admin authentication before deployment.
- Keep product storage in Cloudflare KV or migrate to D1 if relational queries become necessary.
- Use official Amazon API access for product title/image automation if available.
- Keep a visible Amazon Associates disclosure on the public site.
