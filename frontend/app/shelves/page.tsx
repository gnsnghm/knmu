import { apiGet } from "@/lib/api";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Shelf = { id: number; label: string };

export default async function Shelves({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q ?? "";
  const shelves = await apiGet<Shelf[]>(
    `/api/shelves?${new URLSearchParams({ q })}`,
  );

  return (
    <main className="p-4 max-w-md mx-auto space-y-4">
      <form>
        <input
          name="q"
          defaultValue={q}
          placeholder="検索"
          className="border rounded w-full px-2 py-1"
        />
      </form>
      <ul className="space-y-2">
        {shelves.map((s) => (
          <li key={s.id} className="border rounded p-3 flex justify-between">
            <span>{s.label}</span>
            <Link href={`/shelves/${s.id}`} className="text-blue-600 underline">
              編集
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/shelves/new"
        className="inline-block rounded bg-blue-600 text-white px-4 py-2"
      >
        + 追加
      </Link>
    </main>
  );
}
