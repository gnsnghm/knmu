import { apiGet } from "@/lib/api";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Group = { id: number; name: string };

export default async function Groups() {
  const groups = await apiGet<Group[]>("/api/groups");

  return (
    <main className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold">まとめコード</h1>
      <ul className="space-y-2">
        {groups.map((g) => (
          <li key={g.id} className="border rounded p-3 flex justify-between">
            <span>{g.name}</span>
            <Link href={`/groups/${g.id}`} className="text-blue-600 underline">
              編集
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/groups/new"
        className="rounded bg-blue-600 text-white px-4 py-2"
      >
        + 追加
      </Link>
    </main>
  );
}
