import Link from "next/link";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

function getApiBase(): string {
  const env = process.env.NEXT_PUBLIC_API_BASE;
  if (env) return env;

  const hdr = headers();
  const host = hdr.get("host");
  if (host) {
    const proto = hdr.get("x-forwarded-proto") ?? "http";
    return `${proto}://${host}`;
  }
  return "http://backend:3000"; // fallback
}

async function fetchStocks(q: string) {
  const res = await fetch(`${getApiBase()}/api/stocks?${q}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`fetch_error_${res.status}`);
  return res.json() as Promise<any[]>;
}

export default async function StockList({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q ?? "";
  const stocks = await fetchStocks(new URLSearchParams({ q }).toString());

  return (
    <main className="p-4 max-w-md mx-auto space-y-4">
      <form>
        <input
          name="q"
          defaultValue={q}
          placeholder="検索"
          className="border rounded px-3 py-2 w-full"
        />
      </form>

      <ul className="space-y-2">
        {stocks.length === 0 && (
          <li className="text-gray-500">在庫がありません</li>
        )}
        {stocks.map((s) => (
          <li key={s.id} className="border rounded p-3">
            <p>{s.name}</p>
            <p className="text-sm text-gray-500">在庫: {s.quantity}</p>
            <Link href={`/stocks/${s.id}`} className="text-blue-600 underline">
              編集
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
