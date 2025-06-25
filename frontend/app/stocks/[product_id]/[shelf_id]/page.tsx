// frontend/app/stocks/[product_id]/[shelf_id]/page.tsx
import StockForm from "@/components/StockForm";
import { notFound } from "next/navigation";

async function fetchStock(product: string, shelf: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/api/stocks/${product}/${shelf}`,
    {
      cache: "no-store",
    }
  );
  if (res.status === 404) return { total_quantity: 0 };
  if (!res.ok) throw new Error("failed to fetch");
  return res.json();
}

export default async function StockDetail({
  params,
}: {
  params: { product_id: string; shelf_id: string };
}) {
  const { product_id, shelf_id } = params;
  const data = await fetchStock(product_id, shelf_id);
  if (!data) notFound();

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">
        商品 {product_id} / 棚 {shelf_id}
      </h2>
      <p>現在在庫：{data.total_quantity} 個</p>

      <StockForm
        defaultProduct={Number(product_id)}
        defaultShelf={Number(shelf_id)}
        onSuccess={async () => {
          "use server";
          // Next.js 14: 再検証などを行うならここに書く
        }}
      />
    </div>
  );
}
