// frontend/app/stocks/page.tsx
"use client";
import Link from "next/link";
import useSWR from "swr";

type StockRow = {
  product_id: number;
  product_name: string;
  shelf_id: number;
  shelf_label: string;
  total_quantity: number;
  image_url: string | null;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function StockListPage() {
  const { data, error } = useSWR<StockRow[]>("/api/stocks", fetcher);

  if (error) return <p className="text-red-600">読み込みエラー</p>;
  if (!data) return <p>読み込み中…</p>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">在庫一覧</h1>
        <Link
          href="/stocks/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium"
        >
          + 在庫を登録
        </Link>
      </div>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 px-2 w-16">画像</th>
            <th className="py-2 px-2">商品</th>
            <th className="py-2 px-2">棚</th>
            <th className="py-2 px-2 text-right">在庫数</th>
          </tr>
        </thead>
        <tbody>
          {data
            .filter((row) => row.total_quantity > 0)
            .map((row) => (
              <tr
                key={`${row.product_id}-${row.shelf_id}`}
                className="border-b last:border-none"
              >
                <td className="py-2 px-2">
                  {row.image_url ? (
                    <img
                      src={row.image_url}
                      alt={row.product_name}
                      className="w-12 h-12 object-cover rounded"
                      // 画像読み込みエラー時のフォールバック
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                      <span role="img" aria-label="no image">
                        📦
                      </span>
                    </div>
                  )}
                </td>
                <td className="py-2 px-2">
                  <a
                    href={`/stocks/${row.shelf_id}/${row.product_id}`}
                    className="text-blue-600 underline"
                  >
                    {row.product_name}
                  </a>
                </td>
                <td className="py-2 px-2">{row.shelf_label}</td>
                <td className="py-2 px-2 text-right">{row.total_quantity}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
