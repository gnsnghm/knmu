import { getApiBase } from "@/lib/api";
import StockForm from "./stockForm";
import { notFound } from "next/navigation";

/**
 * /stocks/[id]
 * - params.id は products.id (数値)
 * - GET /api/products/:id で商品を取得
 */
export default async function StockPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (Number.isNaN(id)) notFound();

  const res = await fetch(`${getApiBase()}/api/products/${id}`, {
    cache: "no-store",
  });

  if (res.status === 404) notFound();
  if (!res.ok) throw new Error(`failed_to_fetch_product_${res.status}`);

  const product: { name?: string } = await res.json();

  return (
    <main className="p-4 space-y-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold">
        在庫登録: {product.name || "(名称未登録)"}
      </h1>

      {/* id ベースでリダイレクト */}
      <StockForm productId={id} redirectTo={`/products/${id}`} />
    </main>
  );
}
