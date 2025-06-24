import Link from "next/link";
export const dynamic = "force-dynamic";

async function fetchShelves() {
  const r = await fetch("/api/shelves", { cache: "no-store" });
  return r.json();
}

export default async function ShelfList() {
  const shelves: any[] = await fetchShelves();
  return (
    <main className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">棚</h1>
      <Link href="/shelves/new" className="underline text-blue-600">
        ＋新規作成
      </Link>
      <ul className="mt-4 space-y-2">
        {shelves.map((g) => (
          <li key={g.id}>
            <Link
              href={`/shelves/${g.id}`}
              className="block p-3 border rounded hover:bg-gray-50"
            >
              {g.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
