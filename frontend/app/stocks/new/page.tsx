"use client";

import StockForm from "@/components/StockForm";
import { useRouter } from "next/navigation";

export default function NewStockPage() {
  const router = useRouter();

  // 在庫登録が成功したときに呼び出される関数
  const handleSuccess = () => {
    // 在庫一覧ページに戻る
    router.push("/stocks");
  };

  return (
    <main className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">在庫を登録する</h1>
      <StockForm onSuccess={handleSuccess} />
    </main>
  );
}
