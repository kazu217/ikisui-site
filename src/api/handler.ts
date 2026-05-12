/// <reference types="@cloudflare/workers-types" />

import { seedProducts } from "../data/seedProducts";
import type { AffiliateProduct } from "../domain/products";

export interface ApiEnv {
  PRODUCTS_KV: KVNamespace;
  ADMIN_PASSWORD: string;
  SESSION_SECRET: string;
}

const PRODUCTS_KEY = "products";
const SESSION_COOKIE = "kissui_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function jsonResponse(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...init.headers
    }
  });
}

function unauthorized(): Response {
  return jsonResponse({ ok: false, error: "unauthorized" }, { status: 401 });
}

function getCookie(request: Request, name: string): string | undefined {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function toBase64Url(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(
    Math.ceil(value.length / 4) * 4,
    "="
  );
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

async function sign(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return toBase64Url(signature);
}

async function createSession(secret: string): Promise<string> {
  const payload = toBase64Url(
    new TextEncoder().encode(
      JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS })
    )
  );
  return `${payload}.${await sign(payload, secret)}`;
}

async function isValidSession(request: Request, env: ApiEnv): Promise<boolean> {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token || !env.SESSION_SECRET) {
    return false;
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature || signature !== (await sign(payload, env.SESSION_SECRET))) {
    return false;
  }

  try {
    const data = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as {
      exp?: number;
    };
    return typeof data.exp === "number" && data.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

async function readProducts(env: ApiEnv): Promise<AffiliateProduct[]> {
  const stored = await env.PRODUCTS_KV.get(PRODUCTS_KEY, "json");
  return Array.isArray(stored) ? (stored as AffiliateProduct[]) : seedProducts;
}

function normalizeProducts(input: unknown): AffiliateProduct[] | null {
  if (!Array.isArray(input)) {
    return null;
  }

  const products = input.filter((item): item is AffiliateProduct => {
    const candidate = item as Partial<AffiliateProduct>;
    return Boolean(
      candidate &&
        typeof candidate.asin === "string" &&
        typeof candidate.title === "string" &&
        typeof candidate.affiliateUrl === "string"
    );
  });

  return products.length === input.length ? products : null;
}

export async function handleApi(request: Request, env: ApiEnv): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname === "/api/products" && request.method === "GET") {
    return jsonResponse({ products: await readProducts(env) });
  }

  if (url.pathname === "/api/admin/session" && request.method === "GET") {
    return jsonResponse({ authenticated: await isValidSession(request, env) });
  }

  if (url.pathname === "/api/admin/login" && request.method === "POST") {
    const body = (await request.json().catch(() => null)) as { password?: string } | null;
    if (!env.ADMIN_PASSWORD || body?.password !== env.ADMIN_PASSWORD) {
      return unauthorized();
    }

    const token = await createSession(env.SESSION_SECRET);
    return jsonResponse(
      { ok: true },
      {
        headers: {
          "set-cookie": `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}; Path=/`
        }
      }
    );
  }

  if (url.pathname === "/api/admin/logout" && request.method === "POST") {
    return jsonResponse(
      { ok: true },
      {
        headers: {
          "set-cookie": `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/`
        }
      }
    );
  }

  if (url.pathname === "/api/admin/products" && request.method === "PUT") {
    if (!(await isValidSession(request, env))) {
      return unauthorized();
    }

    const body = (await request.json().catch(() => null)) as { products?: unknown } | null;
    const products = normalizeProducts(body?.products);
    if (!products) {
      return jsonResponse({ ok: false, error: "invalid_products" }, { status: 400 });
    }

    await env.PRODUCTS_KV.put(PRODUCTS_KEY, JSON.stringify(products));
    return jsonResponse({ ok: true, products });
  }

  return jsonResponse({ ok: false, error: "not_found" }, { status: 404 });
}
