# 生粋サイト

Amazonアフィリエイト用の商品サイトと、商品を追加するためのローカル管理アプリです。
現在はCloudflare Pages Functions + KVの無料枠で、公開サイト上の管理画面から商品を保存できます。

## What It Does

- 公開用の商品一覧サイトを表示します。
- トップ中央にAmazonへの大きいアフィリエイトリンクを表示します。
- 目立たない「管理」リンクからログインして、Amazon.co.jpの商品URLまたはASINを入力できます。
- URL内の `tag` があればそのtracking IDを使います。
- URL内に `tag` がない場合は、管理画面のデフォルトtracking IDで直接アフィリエイトリンクを生成します。
- 商品名、カテゴリ、画像URL、紹介文、バッジは手入力します。
- 商品データはCloudflare KVに保存され、公開版へ自動反映されます。
- JSON出力/読込で商品データをバックアップできます。

## Compliance Notes

- Amazonの商品ページはスクレイピングしません。
- 価格、在庫、割引、配送条件は表示しません。
- 商品リンクはAmazon.co.jpへの直接リンクです。
- 商品情報の自動取得は、公式Amazon APIアクセスが使える段階で追加します。

## Local Development

```bash
npm install
npm run dev
npm run dev:worker
npm test
npm run lint
npm run typecheck
npm run build
npm run deploy
```

Public app URL:

- https://kissui-site.pages.dev/

## Production Notes

- `ADMIN_PASSWORD` and `SESSION_SECRET` are Cloudflare Pages secrets.
- `.env` is local-only and must not be committed.
- Cloudflare KV namespace `PRODUCTS_KV` stores the product list.
