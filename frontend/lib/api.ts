// frontend/lib/api.ts
import { headers } from "next/headers";

/** 実行環境に応じた API ベース URL を返す */
export function getApiBase(): string {
  if (process.env.NEXT_PUBLIC_API_BASE) return process.env.NEXT_PUBLIC_API_BASE;

  try {
    const h = headers();
    const host = h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "http";
    if (host) return `${proto}://${host}`;
  } catch (_) {
    /* headers() は CSR では使えない → 無視 */
  }

  return "http://backend:3000";
}

/** 汎用 fetch ― 相対パスを渡すと自動的に絶対 URL 化 */
export async function apiGet(path: string, init?: RequestInit) {
  const url = path.startsWith("http") ? path : `${getApiBase()}${path}`;
  const res = await fetch(url, { cache: "no-store", ...init });
  if (!res.ok) throw new Error(`fetch_error_${res.status}`);
  return res.json();
}
