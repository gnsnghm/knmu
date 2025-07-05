"use client";
import { useState, useEffect } from "react";
import StockForm from "@/components/StockForm";

export default function StockDetail({
  params,
}: {
  params: { product_id: string; shelf_id: string };
}) {
  const { product_id, shelf_id } = params;
  const [currentStock, setCurrentStock] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [history, setHistory] = useState<
    { id: number; add_quantity: number; created_at: string }[]
  >([]);

  // 在庫数を取得する関数
  const fetchStock = async () => {
    const apiUrl = `/api/stocks/${product_id}/${shelf_id}`;
    const res = await fetch(apiUrl, { cache: "no-store" });

    if (res.status === 404) return 0;
    if (!res.ok) throw new Error("在庫データの取得に失敗しました");
    const data = await res.json();
    return data.total_quantity;
  };

  // 履歴を取得する関数
  const fetchHistory = async () => {
    const apiUrl = `/api/stocks/${product_id}/${shelf_id}/history?limit=5`;
    const res = await fetch(apiUrl, { cache: "no-store" });
    if (!res.ok) throw new Error("履歴の取得に失敗しました");
    return res.json();
  };

  // 初回読み込み時に在庫を取得
  useEffect(() => {
    Promise.all([fetchStock(), fetchHistory()])
      .then(([stockQty, hist]) => {
        setCurrentStock(stockQty);
        setHistory(hist);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [product_id, shelf_id]);

  // フォーム送信成功時の処理
  const handleSuccess = async () => {
    const [latestStock, latestHistory] = await Promise.all([
      fetchStock(),
      fetchHistory(),
    ]);
    setCurrentStock(latestStock);
    setHistory(latestHistory);
    setSuccessMessage("登録が完了しました");
    setTimeout(() => setSuccessMessage(""), 3000); // 3秒後にメッセージを消す
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <p className="text-lg">
        現在在庫：<span className="font-bold text-2xl">{currentStock}</span> 個
      </p>

      {successMessage && (
        <div className="p-3 bg-green-100 text-green-800 border border-green-200 rounded-md">
          {successMessage}
        </div>
      )}

      {history.length > 0 && (
        <div>
          <h3 className="font-semibold">直近の履歴</h3>
          <ul className="list-disc pl-5 space-y-1 mt-1 text-sm">
            {history.map((h) => (
              <li key={h.id}>
                {new Date(h.created_at).toLocaleString()} :{" "}
                {h.add_quantity > 0 ? `+${h.add_quantity}` : h.add_quantity}
              </li>
            ))}
          </ul>
        </div>
      )}

      <StockForm
        defaultProduct={Number(product_id)}
        defaultShelf={Number(shelf_id)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
