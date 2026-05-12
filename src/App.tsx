import {
  ArrowUpRight,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileJson,
  Image,
  LayoutGrid,
  Link,
  PackagePlus,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Trash2
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  type AffiliateProduct,
  createAffiliateProduct,
  parseAmazonProductInput,
  upsertAffiliateProduct
} from "./domain/products";

type View = "site" | "admin";

const STORAGE_KEY = "amazon3.affiliateProducts.v1";
const SITE_NAME = "俺がAmazon PA-APIへのアクセス件取得の条件をクリアのためのサイト";
const MAIN_AFFILIATE_URL =
  "https://www.amazon.co.jp?&linkCode=ll2&tag=rikougakubu03-22&linkId=674437ff17d1d998509ceba5b979b141&ref_=as_li_ss_tl";
const SHORT_AFFILIATE_URL = "https://amzn.to/49JXWps";

const seedProducts: AffiliateProduct[] = [
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
    description: "管理画面からAmazon URLを入力すると、この一覧に新しい商品カードが追加されます。",
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

function readStoredProducts(): AffiliateProduct[] {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? (JSON.parse(value) as AffiliateProduct[]) : seedProducts;
  } catch {
    return seedProducts;
  }
}

function App() {
  const [view, setView] = useState<View>("site");
  const [products, setProducts] = useState<AffiliateProduct[]>(readStoredProducts);
  const [trackingId, setTrackingId] = useState("rikougakubu03-22");
  const [sourceUrl, setSourceUrl] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("ゲーム");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [badge, setBadge] = useState("");
  const [featured, setFeatured] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [notice, setNotice] = useState("Amazon URLを入れると、ASINとtagを読み取って商品カードを追加できます。");
  const [importText, setImportText] = useState("");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  const parsedInput = useMemo(() => parseAmazonProductInput(sourceUrl), [sourceUrl]);
  const categories = useMemo(
    () => ["すべて", ...Array.from(new Set(products.map((product) => product.category)))],
    [products]
  );
  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const categoryMatches =
        selectedCategory === "すべて" || product.category === selectedCategory;
      const queryMatches =
        !normalizedQuery ||
        [product.title, product.category, product.asin, product.description]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return categoryMatches && queryMatches;
    });
  }, [products, query, selectedCategory]);

  function resetForm() {
    setSourceUrl("");
    setTitle("");
    setCategory("ゲーム");
    setDescription("");
    setImageUrl("");
    setBadge("");
    setFeatured(false);
  }

  function addProduct() {
    try {
      const product = createAffiliateProduct({
        sourceUrl,
        trackingId,
        title,
        category,
        description,
        imageUrl,
        badge,
        featured
      });

      setProducts((current) => upsertAffiliateProduct(current, product));
      setNotice(`${product.title} をサイトに追加しました。`);
      resetForm();
      setView("site");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "商品の追加に失敗しました。");
    }
  }

  function removeProduct(asin: string) {
    setProducts((current) => current.filter((product) => product.asin !== asin));
    setNotice(`${asin} を削除しました。`);
  }

  async function copyExportJson() {
    const json = JSON.stringify(products, null, 2);
    setImportText(json);

    try {
      await navigator.clipboard.writeText(json);
      setNotice("商品JSONをクリップボードにコピーしました。");
    } catch {
      setNotice("商品JSONを下の欄に出力しました。");
    }
  }

  function importProducts() {
    try {
      const parsed = JSON.parse(importText) as AffiliateProduct[];
      if (!Array.isArray(parsed)) {
        throw new Error("JSON配列ではありません");
      }
      setProducts(parsed);
      setNotice(`${parsed.length}件の商品JSONを読み込みました。`);
    } catch {
      setNotice("商品JSONの形式を確認してください。");
    }
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand">
          <div className="brand-mark">A</div>
          <div>
            <strong>{SITE_NAME}</strong>
            <span>Amazon PA-APIアクセス権取得チャレンジ</span>
          </div>
        </div>
        <nav className="view-switch" aria-label="表示切替">
          <button
            className={view === "site" ? "switch-button active" : "switch-button"}
            onClick={() => setView("site")}
            type="button"
          >
            <LayoutGrid size={18} />
            サイト
          </button>
          <button
            className={view === "admin" ? "switch-button active" : "switch-button"}
            onClick={() => setView("admin")}
            type="button"
          >
            <PackagePlus size={18} />
            商品追加
          </button>
        </nav>
      </header>

      <main>
        {view === "site" ? (
          <PublicSite
            categories={categories}
            products={visibleProducts}
            query={query}
            selectedCategory={selectedCategory}
            onQueryChange={setQuery}
            onCategoryChange={setSelectedCategory}
          />
        ) : (
          <AdminApp
            badge={badge}
            category={category}
            description={description}
            featured={featured}
            imageUrl={imageUrl}
            importText={importText}
            notice={notice}
            parsedInput={parsedInput}
            products={products}
            sourceUrl={sourceUrl}
            title={title}
            trackingId={trackingId}
            onAddProduct={addProduct}
            onBadgeChange={setBadge}
            onCategoryChange={setCategory}
            onCopyExportJson={copyExportJson}
            onDescriptionChange={setDescription}
            onFeaturedChange={setFeatured}
            onImageUrlChange={setImageUrl}
            onImportProducts={importProducts}
            onImportTextChange={setImportText}
            onRemoveProduct={removeProduct}
            onSourceUrlChange={setSourceUrl}
            onTitleChange={setTitle}
            onTrackingIdChange={setTrackingId}
          />
        )}
      </main>
    </div>
  );
}

function PublicSite(props: {
  categories: string[];
  products: AffiliateProduct[];
  query: string;
  selectedCategory: string;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}) {
  return (
    <section className="public-layout">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Amazon PA-API Access Challenge</p>
          <h1>{SITE_NAME}</h1>
        </div>
        <p className="disclosure">
          Amazon PA-APIへのアクセス権を取得するためには、過去30日間に条件を満たす売り上げを10件有する必要があります。よければ下のAmazonリンクから買い物して協力してもらえると助かります。Amazonのアソシエイトとして、当サイトは適格販売により収入を得ています。
        </p>
      </div>

      <section className="main-affiliate-box" aria-labelledby="main-affiliate-title">
        <p className="eyebrow">Main Link</p>
        <h2 id="main-affiliate-title">まずはここからAmazonへ</h2>
        <a
          className="main-affiliate-link"
          href={MAIN_AFFILIATE_URL}
          rel="sponsored noopener noreferrer"
          target="_blank"
        >
          Amazonで買い物して協力する
          <ArrowUpRight size={28} />
        </a>
        <a
          className="short-link"
          href={SHORT_AFFILIATE_URL}
          rel="sponsored noopener noreferrer"
          target="_blank"
        >
          短縮リンク: {SHORT_AFFILIATE_URL}
        </a>
        <p>個々の商品リンクはこの下に並べています。価格・在庫・配送条件はAmazon.co.jp側で確認してください。</p>
      </section>

      <div className="toolbar">
        <label className="search-field">
          <Search size={18} />
          <input
            value={props.query}
            onChange={(event) => props.onQueryChange(event.target.value)}
            placeholder="商品名・ASIN・カテゴリで検索"
          />
        </label>
        <div className="category-tabs" aria-label="カテゴリ">
          {props.categories.map((category) => (
            <button
              key={category}
              className={props.selectedCategory === category ? "chip active" : "chip"}
              onClick={() => props.onCategoryChange(category)}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="product-grid">
        {props.products.map((product) => (
          <article key={product.asin} className={product.featured ? "product-card featured" : "product-card"}>
            <div className="product-media">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt="" loading="lazy" />
              ) : (
                <div className="image-fallback">
                  <Image size={30} />
                </div>
              )}
              {product.badge && <span className="badge">{product.badge}</span>}
            </div>
            <div className="product-body">
              <div className="product-meta">
                <span>{product.category}</span>
                <span>{product.asin}</span>
              </div>
              <h2>{product.title}</h2>
              <p>{product.description || "商品の詳細、価格、在庫状況はAmazon.co.jpの商品ページで確認してください。"}</p>
              <a className="buy-link" href={product.affiliateUrl} rel="sponsored noopener noreferrer" target="_blank">
                Amazonで見る
                <ArrowUpRight size={18} />
              </a>
            </div>
          </article>
        ))}
      </div>

      {props.products.length === 0 && (
        <div className="empty-state">
          <Search size={24} />
          <strong>表示できる商品がありません</strong>
          <span>検索条件を変えるか、商品追加画面から商品を登録してください。</span>
        </div>
      )}
    </section>
  );
}

function AdminApp(props: {
  badge: string;
  category: string;
  description: string;
  featured: boolean;
  imageUrl: string;
  importText: string;
  notice: string;
  parsedInput: ReturnType<typeof parseAmazonProductInput>;
  products: AffiliateProduct[];
  sourceUrl: string;
  title: string;
  trackingId: string;
  onAddProduct: () => void;
  onBadgeChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onCopyExportJson: () => void;
  onDescriptionChange: (value: string) => void;
  onFeaturedChange: (value: boolean) => void;
  onImageUrlChange: (value: string) => void;
  onImportProducts: () => void;
  onImportTextChange: (value: string) => void;
  onRemoveProduct: (asin: string) => void;
  onSourceUrlChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onTrackingIdChange: (value: string) => void;
}) {
  return (
    <section className="admin-layout">
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Admin App</p>
          <h1>Amazon URLから商品カードを追加</h1>
        </div>
        <div className="notice">{props.notice}</div>
      </div>

      <div className="admin-grid">
        <form className="panel stack" onSubmit={(event) => event.preventDefault()}>
          <div className="panel-title">
            <Link size={19} />
            <h2>商品入力</h2>
          </div>
          <label>
            Amazon URL / ASIN
            <input
              value={props.sourceUrl}
              onChange={(event) => props.onSourceUrlChange(event.target.value)}
              placeholder="https://www.amazon.co.jp/dp/B0...?...&tag=yourtag-22"
            />
          </label>
          <div className={props.parsedInput ? "parse-result ok" : "parse-result"}>
            {props.parsedInput ? (
              <>
                <CheckCircle2 size={17} />
                <span>
                  ASIN {props.parsedInput.asin}
                  {props.parsedInput.trackingIdFromUrl
                    ? ` / tag ${props.parsedInput.trackingIdFromUrl}`
                    : " / tagは下の設定を使用"}
                </span>
              </>
            ) : (
              <>
                <ShieldCheck size={17} />
                <span>Amazon.co.jpの通常URLまたはASINを受け付けます。</span>
              </>
            )}
          </div>
          <label>
            デフォルト tracking ID
            <input
              value={props.trackingId}
              onChange={(event) => props.onTrackingIdChange(event.target.value)}
              placeholder="yourtag-22"
            />
          </label>
          <label>
            商品名
            <input
              value={props.title}
              onChange={(event) => props.onTitleChange(event.target.value)}
              placeholder="サイトに表示する商品名"
            />
          </label>
          <div className="two-fields">
            <label>
              カテゴリ
              <input
                value={props.category}
                onChange={(event) => props.onCategoryChange(event.target.value)}
              />
            </label>
            <label>
              バッジ
              <input
                value={props.badge}
                onChange={(event) => props.onBadgeChange(event.target.value)}
                placeholder="おすすめ"
              />
            </label>
          </div>
          <label>
            画像URL
            <input
              value={props.imageUrl}
              onChange={(event) => props.onImageUrlChange(event.target.value)}
              placeholder="https://..."
            />
          </label>
          <label>
            紹介文
            <textarea
              value={props.description}
              onChange={(event) => props.onDescriptionChange(event.target.value)}
              rows={4}
              placeholder="価格や在庫を断定しない短い紹介文"
            />
          </label>
          <label className="toggle-row">
            <input
              checked={props.featured}
              onChange={(event) => props.onFeaturedChange(event.target.checked)}
              type="checkbox"
            />
            <span>おすすめ枠として強調</span>
          </label>
          <button className="primary" onClick={props.onAddProduct} type="button">
            <PackagePlus size={18} />
            サイトに追加
          </button>
        </form>

        <div className="panel stack">
          <div className="panel-title">
            <Settings size={19} />
            <h2>登録済み商品</h2>
          </div>
          <div className="admin-list">
            {props.products.map((product) => (
              <div key={product.asin} className="admin-row">
                <div>
                  <strong>{product.title}</strong>
                  <span>
                    {product.category} / {product.asin}
                  </span>
                </div>
                <div className="row-actions">
                  <a href={product.affiliateUrl} rel="sponsored noopener noreferrer" target="_blank" title="Amazonで開く">
                    <ExternalLink size={17} />
                  </a>
                  <button onClick={() => props.onRemoveProduct(product.asin)} title="削除" type="button">
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="json-actions">
            <button className="ghost" onClick={props.onCopyExportJson} type="button">
              <Copy size={17} />
              JSON出力
            </button>
            <button className="ghost" onClick={props.onImportProducts} type="button">
              <FileJson size={17} />
              JSON読込
            </button>
          </div>
          <textarea
            className="json-box"
            value={props.importText}
            onChange={(event) => props.onImportTextChange(event.target.value)}
            rows={8}
            placeholder="商品JSONのバックアップや読込に使います"
          />
          <div className="guardrails">
            <Star size={17} />
            <span>このMVPはAmazonの商品ページを取得しません。商品名・画像・説明は手入力です。</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default App;
