import { apiGet } from "@/lib/api";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProductDetail({
  params,
}: {
  params: { barcode: string };
}) {
  const product = await apiGet(`/api/products/${params.barcode}`);
  const stocks = await apiGet(`/api/stocks?product=${params.barcode}`);

  return (
    <main className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold">{product.name}</h1>
      {product.image_url && (
        <img src={product.image_url} alt="" className="w-full rounded" />
      )}
      <p>バーコード: {product.barcode}</p>
      <p>ブランド: {product.brand ?? "―"}</p>

      <h2 className="font-semibold mt-6">在庫</h2>
      <ul className="space-y-2">
        {stocks.map((s: any) => (
          <li key={s.id} className="border rounded p-3 flex justify-between">
            <span>棚: {s.shelf_label ?? "未設定"}</span>
            <span>{s.quantity}</span>
          </li>
        ))}
      </ul>

      <Link
        href={`/stocks/new?barcode=${product.barcode}`}
        className="rounded bg-blue-600 text-white px-4 py-2"
      >
        在庫を追加
      </Link>
    </main>
  );
}
