import Link from "next/link";

async function fetchStocks(query: string) {
  const r = await fetch(`/api/stocks?${query}`, { cache: "no-store" });
  return r.json();
}

export default async function StockList({
  searchParams,
}: {
  searchParams: any;
}) {
  const q = searchParams.q ?? "";
  const stocks: any[] = await fetchStocks(
    new URLSearchParams({ q }).toString()
  );

  return (
    <main className="p-4 max-w-md mx-auto">
      <form>
        <input
          name="q"
          defaultValue={q}
          placeholder="検索"
          className="border rounded px-3 py-2 w-full"
        />
      </form>

      <ul className="mt-4 space-y-2">
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
