import type { AffiliateProduct } from "../domain/products";

export const seedProducts: AffiliateProduct[] = [
  {
    id: "product-B0SAMPLE01",
    asin: "B0SAMPLE01",
    title: "Nintendo Switch 関連アクセサリー",
    category: "ゲーム",
    description: "入荷や価格の断定をせず、Amazonの商品ページで購入条件を確認してもらうための掲載例です。",
    imageUrl:
      "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=900&q=80",
    affiliateUrl: "https://www.amazon.co.jp/dp/B0SAMPLE01?tag=example-22",
    sourceUrl: "https://www.amazon.co.jp/dp/B0SAMPLE01?tag=example-22",
    badge: "注目",
    featured: true,
    createdAt: new Date("2026-05-12T10:00:00+09:00").toISOString(),
    updatedAt: new Date("2026-05-12T10:00:00+09:00").toISOString()
  },
  {
    id: "product-B0SAMPLE02",
    asin: "B0SAMPLE02",
    title: "PlayStation 周辺機器セレクション",
    category: "ゲーム",
    description: "手入力の商品紹介文だけを表示します。価格・在庫・配送条件はリンク先のAmazonが正です。",
    imageUrl:
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=900&q=80",
    affiliateUrl: "https://www.amazon.co.jp/dp/B0SAMPLE02?tag=example-22",
    sourceUrl: "https://www.amazon.co.jp/dp/B0SAMPLE02?tag=example-22",
    badge: "定番",
    featured: false,
    createdAt: new Date("2026-05-12T10:05:00+09:00").toISOString(),
    updatedAt: new Date("2026-05-12T10:05:00+09:00").toISOString()
  },
  {
    id: "product-B0SAMPLE03",
    asin: "B0SAMPLE03",
    title: "PC・ガジェットおすすめ枠",
    category: "ガジェット",
    description: "ガジェットやPC周辺機器の候補をまとめています。価格と在庫はAmazonで確認してください。",
    imageUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    affiliateUrl: "https://www.amazon.co.jp/dp/B0SAMPLE03?tag=example-22",
    sourceUrl: "https://www.amazon.co.jp/dp/B0SAMPLE03?tag=example-22",
    badge: "比較候補",
    featured: false,
    createdAt: new Date("2026-05-12T10:10:00+09:00").toISOString(),
    updatedAt: new Date("2026-05-12T10:10:00+09:00").toISOString()
  }
];
