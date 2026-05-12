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
import { seedProducts } from "./data/seedProducts";

type View = "site" | "admin";

const SITE_NAME = "生粋サイト";
const MAIN_AFFILIATE_URL =
  "https://www.amazon.co.jp?&linkCode=ll2&tag=rikougakubu03-22&linkId=674437ff17d1d998509ceba5b979b141&ref_=as_li_ss_tl";

function App() {
  const [view, setView] = useState<View>("site");
  const [products, setProducts] = useState<AffiliateProduct[]>(seedProducts);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [publicNotice, setPublicNotice] = useState("");
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
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [adminLoginError, setAdminLoginError] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    void loadProducts();
    void refreshAdminSession();
  }, []);

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

  async function loadProducts() {
    setIsLoadingProducts(true);
    try {
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error("products request failed");
      }
      const data = (await response.json()) as { products?: AffiliateProduct[] };
      setProducts(Array.isArray(data.products) ? data.products : seedProducts);
      setPublicNotice("");
    } catch {
      setProducts(seedProducts);
      setPublicNotice("商品データの取得に失敗したため、初期データを表示しています。");
    } finally {
      setIsLoadingProducts(false);
    }
  }

  async function saveProducts(nextProducts: AffiliateProduct[], successMessage: string) {
    const response = await fetch("/api/admin/products", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ products: nextProducts })
    });

    if (response.status === 401) {
      setIsAdminAuthenticated(false);
      setNotice("ログインし直してください。");
      return false;
    }

    if (!response.ok) {
      setNotice("保存に失敗しました。少し待ってからもう一度試してください。");
      return false;
    }

    const data = (await response.json()) as { products?: AffiliateProduct[] };
    setProducts(Array.isArray(data.products) ? data.products : nextProducts);
    setNotice(successMessage);
    return true;
  }

  async function addProduct() {
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
      const nextProducts = upsertAffiliateProduct(products, product);
      const didSave = await saveProducts(
        nextProducts,
        `${product.title} を公開サイトに追加しました。`
      );

      if (didSave) {
        resetForm();
        setView("site");
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "商品の追加に失敗しました。");
    }
  }

  async function removeProduct(asin: string) {
    await saveProducts(
      products.filter((product) => product.asin !== asin),
      `${asin} を公開サイトから削除しました。`
    );
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

  async function importProducts() {
    try {
      const parsed = JSON.parse(importText) as AffiliateProduct[];
      if (!Array.isArray(parsed)) {
        throw new Error("JSON配列ではありません");
      }
      await saveProducts(parsed, `${parsed.length}件の商品JSONを公開サイトへ保存しました。`);
    } catch {
      setNotice("商品JSONの形式を確認してください。");
    }
  }

  async function refreshAdminSession() {
    try {
      const response = await fetch("/api/admin/session");
      const data = (await response.json()) as { authenticated?: boolean };
      setIsAdminAuthenticated(Boolean(data.authenticated));
    } catch {
      setIsAdminAuthenticated(false);
    }
  }

  async function loginAdmin() {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: adminPasswordInput })
    });

    if (response.ok) {
      setIsAdminAuthenticated(true);
      setAdminPasswordInput("");
      setAdminLoginError("");
      return;
    }

    setAdminLoginError("パスワードが違います。");
  }

  async function logoutAdmin() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => undefined);
    setIsAdminAuthenticated(false);
    setView("site");
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
        {isAdminAuthenticated && (
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
        )}
      </header>

      <main>
        {view === "site" ? (
          <PublicSite
            categories={categories}
            isLoading={isLoadingProducts}
            notice={publicNotice}
            products={visibleProducts}
            query={query}
            selectedCategory={selectedCategory}
            onQueryChange={setQuery}
            onCategoryChange={setSelectedCategory}
            onOpenAdmin={() => setView("admin")}
          />
        ) : isAdminAuthenticated ? (
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
            onLogout={logoutAdmin}
            onRemoveProduct={removeProduct}
            onSourceUrlChange={setSourceUrl}
            onTitleChange={setTitle}
            onTrackingIdChange={setTrackingId}
          />
        ) : (
          <AdminLogin
            error={adminLoginError}
            password={adminPasswordInput}
            onPasswordChange={setAdminPasswordInput}
            onSubmit={loginAdmin}
          />
        )}
      </main>
    </div>
  );
}

function PublicSite(props: {
  categories: string[];
  isLoading: boolean;
  notice: string;
  products: AffiliateProduct[];
  query: string;
  selectedCategory: string;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onOpenAdmin: () => void;
}) {
  return (
    <section className="public-layout">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Shopping Support Links</p>
          <h1>{SITE_NAME}</h1>
        </div>
        <p className="disclosure">
          Amazon PA APIへのアクセス権を取得するためには、過去30日間に条件を満たす売り上げを10件有する必要があります。よければ下のAmazonリンクから買い物して協力してもらえると助かります。Amazonのアソシエイトとして、当サイトは適格販売により収入を得ています。
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
        <p>個々の商品リンクはこの下に並べています。価格・在庫・配送条件はAmazon.co.jp側で確認してください。</p>
      </section>

      {props.notice && <div className="notice">{props.notice}</div>}

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
          <span>検索条件を変えてもう一度確認してください。</span>
        </div>
      )}

      <footer className="site-footer">
        <span>{props.isLoading ? "商品データを読み込み中" : " "}</span>
        <button className="admin-entry" onClick={props.onOpenAdmin} type="button">
          管理
        </button>
      </footer>
    </section>
  );
}

function AdminLogin(props: {
  error: string;
  password: string;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <section className="admin-login">
      <form
        className="panel stack"
        onSubmit={(event) => {
          event.preventDefault();
          props.onSubmit();
        }}
      >
        <div className="panel-title">
          <ShieldCheck size={19} />
          <h1>管理画面ログイン</h1>
        </div>
        <label>
          パスワード
          <input
            autoComplete="current-password"
            autoFocus
            value={props.password}
            onChange={(event) => props.onPasswordChange(event.target.value)}
            placeholder="管理パスワード"
            type="password"
          />
        </label>
        {props.error && <div className="error-message">{props.error}</div>}
        <button className="primary" type="submit">
          <ShieldCheck size={18} />
          ログイン
        </button>
      </form>
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
  onAddProduct: () => void | Promise<void>;
  onBadgeChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onCopyExportJson: () => void;
  onDescriptionChange: (value: string) => void;
  onFeaturedChange: (value: boolean) => void;
  onImageUrlChange: (value: string) => void;
  onImportProducts: () => void | Promise<void>;
  onImportTextChange: (value: string) => void;
  onLogout: () => void | Promise<void>;
  onRemoveProduct: (asin: string) => void | Promise<void>;
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
        <div className="notice admin-notice">
          <span>{props.notice}</span>
          <button className="ghost" onClick={props.onLogout} type="button">
            ログアウト
          </button>
        </div>
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
