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

  // 在庫数を取得する関数
  const fetchStock = async () => {
    const apiUrl = `/api/stocks/${product_id}/${shelf_id}`;
    const res = await fetch(apiUrl, { cache: "no-store" });

    if (res.status === 404) return 0;
    if (!res.ok) throw new Error("在庫データの取得に失敗しました");
    const data = await res.json();
    return data.total_quantity;
  };

  // 初回読み込み時に在庫を取得
  useEffect(() => {
    fetchStock()
      .then(setCurrentStock)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [product_id, shelf_id]);

  // フォーム送信成功時の処理
  const handleSuccess = async () => {
    const latestStock = await fetchStock();
    setCurrentStock(latestStock);
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

      <StockForm
        defaultProduct={Number(product_id)}
        defaultShelf={Number(shelf_id)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
