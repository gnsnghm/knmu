// frontend/app/stocks/page.tsx
"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function StockListPage() {
  const { data, error } = useSWR("/api/stocks", fetcher);

  if (error) return <p className="text-red-600">読み込みエラー</p>;
  if (!data) return <p>読み込み中…</p>;

  return (
    <div className="p-4">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-2">商品ID</th>
            <th className="py-2">棚ID</th>
            <th className="py-2 text-right">在庫数</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row: any) => (
            <tr
              key={`${row.product_id}-${row.shelf_id}`}
              className="border-b last:border-none"
            >
              <td className="py-2">
                <a
                  href={`/stocks/${row.product_id}/${row.shelf_id}`}
                  className="text-blue-600 underline"
                >
                  {row.product_id}
                </a>
              </td>
              <td className="py-2">{row.shelf_id}</td>
              <td className="py-2 text-right">{row.total_quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
