"use client";
import { useState } from "react";

export default function NewProduct() {
  const [barcode, setBarcode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/products`, {
      method: "POST",
      body: JSON.stringify({ barcode }),
      headers: { "Content-Type": "application/json" },
    });
    location.href = `/products/${barcode}`;
  };

  return (
    <main className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold">商品手動登録</h1>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="JAN コード"
          className="border rounded px-3 py-2 w-full"
        />
        <button className="rounded bg-blue-600 text-white px-4 py-2">
          登録
        </button>
      </form>
    </main>
  );
}
