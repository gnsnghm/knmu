// frontend/lib/api.ts

/**
 * 実行環境に応じた API ベース URL を返す。
 * - `NEXT_PUBLIC_API_BASE` があれば最優先で採用。
 * - ブラウザ側（window が定義されている）では空文字を返し、同一オリジンを想定。
 * - サーバー側では `next/headers` からホスト情報を取得。
 * - 最後のフォールバックとして docker compose 用 URL。
 *
 * ※ `next/headers` は Server Components / Route Handlers 専用モジュールであり、
 *   Client Components から静的に import するとビルドエラーになる。
 *   ここでは動的 `require()` を使ってサーバーサイドの実行時にのみ読み込むことで
 *   クライアントバンドルから除外している。
 */
export function getApiBase(): string {
  // 1. .env で明示指定
  if (process.env.NEXT_PUBLIC_API_BASE) return process.env.NEXT_PUBLIC_API_BASE;

  // 2. ブラウザ側（Client Component）
  if (typeof window !== "undefined") {
    // 相対パス fetch で同一オリジンを使う
    return "";
  }

  // 3. サーバー側（Server Component / Route Handler）
  try {
    // dynamic import でバンドル時エラーを回避
    const { headers } =
      require("next/headers") as typeof import("next/headers");
    const h = headers();
    const host = h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "http";
    if (host) return `${proto}://${host}`;
  } catch (_) {
    /* noop */
  }

  // 4. docker compose / fallback
  return "http://backend:3000";
}

/**
 * API GET helper
 * @param path   絶対 URL または "/api/xxx" のような相対パス
 */
export async function apiGet<T = any>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const base = getApiBase();
  const url = path.startsWith("http") ? path : `${base}${path}`;
  const res = await fetch(url, { cache: "no-store", ...init });
  if (!res.ok) throw new Error(`fetch_error_${res.status}`);
  return res.json();
}
