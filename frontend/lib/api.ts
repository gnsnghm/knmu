// --------- frontend/lib/api.ts ---------
export async function getItem(jan: string) {
  // ① フロント自身の /api を叩く（Next.js が backend へリライト）
  const res = await fetch(`/api/items/${jan}`, {
    credentials: "include", // ← Cloudflare Access Cookie
    headers: { "Content-Type": "application/json" },
  });

  if (res.status === 404) throw new Error("not_found");
  if (!res.ok) throw new Error("server");
  return res.json();
}
