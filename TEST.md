# TEST.md

## Unit Tests

- ASIN extraction from Amazon.co.jp URLs.
- Rejection of non-Amazon URLs.
- Direct affiliate URL generation.
- Product creation from Amazon URL or ASIN.
- Preservation of a URL-provided tracking tag.
- Product upsert by ASIN.

## UI Acceptance Checks

- Public site shows product cards with images, category, ASIN, disclosure, and direct Amazon links.
- Admin screen accepts Amazon.co.jp URLs with affiliate tags.
- Admin screen adds a product to the public list without page reload.
- Products remain after refresh through localStorage.
- JSON export/import works.
- No UI claims live price, stock, discount, or urgency.

## Suggested Commands

```bash
npm test
npm run lint
npm run typecheck
npm run build
```
