# 買い物応援リンク集

Amazonアフィリエイト用の商品サイトと、商品を追加するためのローカル管理アプリです。

## What It Does

- 公開用の商品一覧サイトを表示します。
- トップ中央にAmazonへの大きいアフィリエイトリンクを表示します。
- 管理画面でAmazon.co.jpの商品URLまたはASINを入力できます。
- URL内の `tag` があればそのtracking IDを使います。
- URL内に `tag` がない場合は、管理画面のデフォルトtracking IDで直接アフィリエイトリンクを生成します。
- 商品名、カテゴリ、画像URL、紹介文、バッジは手入力します。
- 商品データはMVPとしてブラウザのlocalStorageに保存します。
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
npm test
npm run lint
npm run typecheck
npm run build
```

Local app URL:

- http://127.0.0.1:5173/

## Next Production Step

公開サイトへ全訪問者共通で商品を反映するには、localStorageをCloudflare Workers + D1などのサーバー保存に置き換え、管理画面に認証を追加してください。
