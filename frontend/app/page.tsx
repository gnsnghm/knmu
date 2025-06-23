import Link from "next/link";

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-xl font-bold mb-4">Consumables Manager</h1>
      <Link href="/scanner" className="underline text-blue-600">
        バーコードをスキャン
      </Link>
    </main>
  );
}
