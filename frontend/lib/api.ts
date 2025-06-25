// frontend/lib/api.ts  (共通ヘルパー・TypeScript版)

/**
 * 実行環境に応じた API ベース URL を返します。
 *
 * 優先度:
 *   1. BACKEND_INTERNAL_URL  (例: https://api.example.com/api)
 *   2. NEXT_PUBLIC_API_BASE  (例: https://api.example.com)
 *   3. CSR では "" を返して相対パス fetch
 *   4. SSR では Host ヘッダから同一オリジンを推定
 *   5. Docker 開発時の "http://backend:3000"
 */
export function getApiBase(): string {
  // 1. 明示設定
  if (process.env.BACKEND_INTERNAL_URL) {
    return process.env.BACKEND_INTERNAL_URL.replace(/\/?api\/?$/, "");
  }
  if (process.env.NEXT_PUBLIC_API_BASE) {
    return process.env.NEXT_PUBLIC_API_BASE;
  }

  // 2. クライアント (ブラウザ)
  if (typeof window !== "undefined") return "";

  // 3. サーバーコンポーネント / Route Handler
  try {
    // dynamic import でバンドル時エラーを回避
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { headers } =
      require("next/headers") as typeof import("next/headers");
    const h = headers();
    const host = h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "http";
    if (host) return `${proto}://${host}`;
  } catch {
    // noop (headers() は CSR では使用不可)
  }

  // 4. Docker compose fallback
  return "http://backend:3000";
}

/** 共通レスポンスエラー型 */
export class ApiError extends Error {
  constructor(public status: number) {
    super(`fetch_error_${status}`);
  }
}

/** GET helper (JSON) */
export async function apiGet<T = any>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${getApiBase()}${path}`;
  const res = await fetch(url, { cache: "no-store", ...init });
  if (!res.ok) throw new ApiError(res.status);
  return res.json() as Promise<T>;
}

/** POST helper (JSON) */
export async function apiPost<T = any>(
  path: string,
  body: unknown,
  init: RequestInit = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${getApiBase()}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    ...init,
  });
  if (!res.ok) throw new ApiError(res.status);
  return res.json() as Promise<T>;
}
