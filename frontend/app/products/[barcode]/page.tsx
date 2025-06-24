import Link from "next/link";

async function getProduct(barcode: string) {
  const r = await fetch(`/api/items/${barcode}`);
  if (!r.ok) return null;
  return r.json();
}

export default async function ProductPage({
  params,
}: {
  params: { barcode: string };
}) {
  const p = await getProduct(params.barcode);
  return (
    <main className="p-4 max-w-md mx-auto space-y-4">
      {p ? (
        <>
          <h1 className="text-xl font-semibold">{p.name}</h1>
          {p.image_url && <img src={p.image_url} alt="" className="w-40" />}
          <p>JAN: {p.barcode}</p>
          <p>ブランド: {p.brand || "-"}</p>
          <Link
            href={`/stocks/new?barcode=${p.barcode}`}
            className="underline text-blue-600"
          >
            在庫登録へ
          </Link>
        </>
      ) : (
        <>
          <p>データがありません</p>
          <Link href="/products/new" className="underline text-blue-600">
            手動登録へ
          </Link>
        </>
      )}
    </main>
  );
}
