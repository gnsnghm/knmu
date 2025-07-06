// frontend/lib/api.ts  (共通ヘルパー・TypeScript版)

/**
 * 実行環境に応じた API ベース URL を返します。サーバーサイドでは内部向けURLを、
 * クライアントサイドでは公開URLを返します。
 *
 * 優先度:
 *   - Server: BACKEND_INTERNAL_URL > NEXT_PUBLIC_API_BASE > "http://backend:3000"
 *   - Client: NEXT_PUBLIC_API_BASE > "" (相対パス)
 */
export function getApiBase(): string {
  // サーバーサイド実行時
  if (typeof window === "undefined") {
    // サーバー間通信用の内部URLが最優先
    if (process.env.BACKEND_INTERNAL_URL) {
      return process.env.BACKEND_INTERNAL_URL;
    }
    // なければ公開URL
    if (process.env.NEXT_PUBLIC_API_BASE) {
      return process.env.NEXT_PUBLIC_API_BASE;
    }
    // Docker開発環境用のフォールバック
    return "http://backend:3000";
  }

  // クライアントサイド実行時
  // 公開URLを返す (なければ相対パス)
  return process.env.NEXT_PUBLIC_API_BASE || "";
}

/** 共通レスポンスエラー型 */
export class ApiError extends Error {
  constructor(public status: number) {
    super(`fetch_error_${status}`);
  }
}

export async function apiDelete(
  path: string,
  init: RequestInit = {}
): Promise<void> {
  const url = path.startsWith("http") ? path : `${getApiBase()}${path}`;
  const headers: HeadersInit = { ...init.headers };

  // サーバーサイド実行時、ブラウザからのCookieをバックエンドへ転送する
  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers");
    const cookieHeader = cookies().toString();
    if (cookieHeader) {
      headers["Cookie"] = cookieHeader;
    }
  }

  const res = await fetch(url, {
    method: "DELETE",
    ...init,
    headers,
  });

  if (!res.ok) {
    throw new ApiError(res.status);
  }
  // 204 No Content の場合は body がないので json() を呼ばない
}

/** GET helper (JSON) */
export async function apiGet<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${getApiBase()}${path}`;
  const headers: HeadersInit = { ...init.headers };

  // サーバーサイド実行時、ブラウザからのCookieをバックエンドへ転送する
  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers");
    const cookieHeader = cookies().toString();
    if (cookieHeader) {
      headers["Cookie"] = cookieHeader;
    }
  }

  const res = await fetch(url, { cache: "no-store", ...init, headers });
  if (!res.ok) throw new ApiError(res.status);
  return res.json() as Promise<T>;
}

/** PUT helper (JSON) */
export async function apiPut<T = unknown>(
  path: string,
  body: unknown,
  init: RequestInit = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${getApiBase()}${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...init.headers,
  };

  // サーバーサイド実行時、ブラウザからのCookieをバックエンドへ転送する
  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers");
    const cookieHeader = cookies().toString();
    if (cookieHeader) {
      headers["Cookie"] = cookieHeader;
    }
  }

  const res = await fetch(url, {
    method: "PUT",
    body: JSON.stringify(body),
    ...init,
    headers,
  });
  if (!res.ok) throw new ApiError(res.status);
  return res.json() as Promise<T>;
}

/** POST helper (JSON) */
export async function apiPost<T = unknown>(
  path: string,
  body: unknown,
  init: RequestInit = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${getApiBase()}${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...init.headers,
  };

  // サーバーサイド実行時、ブラウザからのCookieをバックエンドへ転送する
  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers");
    const cookieHeader = cookies().toString();
    if (cookieHeader) {
      headers["Cookie"] = cookieHeader;
    }
  }

  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    ...init,
    headers,
  });
  if (!res.ok) throw new ApiError(res.status);
  return res.json() as Promise<T>;
}
