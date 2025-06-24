import Link from "next/link";
import Nav from "@/components/Nav";

export default function Home() {
  const cards = [
    { href: "/products", title: "商品", ico: "📦" },
    { href: "/stocks", title: "在庫", ico: "📊" },
    { href: "/shelves", title: "棚", ico: "🗄️" },
    { href: "/groups", title: "まとめ", ico: "🗂️" },
    { href: "/me", title: "ユーザ", ico: "👤" },
  ];
  return (
    <main className="p-4">
      <Nav />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="flex flex-col items-center justify-center rounded-lg border p-6
                       hover:bg-gray-50 active:bg-gray-100 h-28 md:h-32"
          >
            <span className="text-3xl">{c.ico}</span>
            <span className="mt-2 font-medium">{c.title}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
