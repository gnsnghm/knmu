import Link from "next/link";
export const dynamic = "force-dynamic";

async function fetchGroups() {
  const r = await fetch("/api/groups", { cache: "no-store" });
  return r.json();
}

export default async function GroupList() {
  const groups: any[] = await fetchGroups();
  return (
    <main className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">まとめコード</h1>
      <Link href="/groups/new" className="underline text-blue-600">
        ＋新規作成
      </Link>
      <ul className="mt-4 space-y-2">
        {groups.map((g) => (
          <li key={g.id}>
            <Link
              href={`/groups/${g.id}`}
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
