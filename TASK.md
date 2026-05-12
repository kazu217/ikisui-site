# TASK.md

Implementation backlog for the Amazon affiliate site MVP.

## Done

- [x] Create project notes before implementation.
- [x] Reuse the Vite/React/TypeScript baseline in `amazon3` only.
- [x] Build a public affiliate product site.
- [x] Build an admin product-add screen.
- [x] Extract ASINs from Amazon.co.jp product URLs.
- [x] Preserve URL tracking tags or generate direct Amazon Associates links.
- [x] Persist products in browser localStorage.
- [x] Add JSON export/import for product backups.
- [x] Add affiliate disclosure to the public site.
- [x] Add tests for product URL parsing and product creation.

## Next

- [ ] Confirm the real Amazon Associates tracking ID.
- [ ] Decide the production hosting target.
- [ ] Replace localStorage with a backend store for deployed shared data.
- [ ] Add admin authentication before public deployment.
- [ ] Add official Amazon API integration if approved access is available.
- [ ] Create a production product JSON seed or D1 migration.

## Guardrails

- Do not scrape Amazon pages.
- Do not display live price or stock claims without approved API data.
- Do not cloak affiliate links.
- Do not commit credentials.
