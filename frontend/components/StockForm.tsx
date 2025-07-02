// frontend/components/StockForm.tsx
"use client";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

type Props = {
  defaultProduct?: number;
  defaultShelf?: number;
  onSuccess?: () => void;
};

type Product = { id: number; name: string };
type Shelf = { id: number; label: string };

export default function StockForm({
  defaultProduct,
  defaultShelf,
  onSuccess,
}: Props) {
  /* --------------------------- 状態管理 --------------------------- */
  const [productId, setProductId] = useState<number | "">(defaultProduct ?? "");
  const [shelfId, setShelfId] = useState<number | "">(defaultShelf ?? "");
  const [products, setProducts] = useState<Product[]>([]);
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [mode, setMode] = useState<"add" | "use">("add");
  const [qty, setQty] = useState<number | "">("");
  const [available, setAvailable] = useState<number>(0);
  const [error, setError] = useState<string>("");

  /* 現在在庫を取得 -------------------------------------------------- */
  useEffect(() => {
    // 商品リストと棚リストを取得
    apiGet<Product[]>("/api/products").then(setProducts);
    apiGet<Shelf[]>("/api/shelves").then(setShelves);
  }, []);

  useEffect(() => {
    if (typeof productId !== "number" || typeof shelfId !== "number") return;
    fetch(`/api/stocks/${productId}/${shelfId}`)
      .then((r) => (r.ok ? r.json() : { total_quantity: 0 }))
      .then((d) => setAvailable(d.total_quantity ?? 0))
      .catch(() => setAvailable(0));
  }, [productId, shelfId]);

  /* 入力バリデーション ------------------------------------------------ */
  useEffect(() => {
    if (qty === "") return setError("");
    if (qty <= 0) return setError("数量は 1 以上を入力してください");
    if (mode === "use" && qty > available)
      return setError(`在庫不足：現在 ${available} 個`);
    setError("");
  }, [qty, mode, available]);

  /* 送信 ------------------------------------------------------------ */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (error || qty === "" || productId === "" || shelfId === "") return;

    const signed = mode === "use" ? -qty : qty;
    const res = await fetch("/api/stocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: productId,
        shelf_id: shelfId,
        quantity: signed,
      }),
    });

    if (res.ok) {
      onSuccess?.();
      setQty("");
    } else {
      const { message } = await res.json();
      setError(message ?? "更新に失敗しました");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-w-sm">
      {/* 商品選択 --------------------------------------------------- */}
      <select
        value={productId}
        onChange={(e) => setProductId(Number(e.target.value))}
        className="w-full rounded border px-3 py-2 bg-white disabled:bg-gray-100"
        required
        disabled={typeof defaultProduct === "number"}
      >
        <option value="" disabled>
          商品を選択してください
        </option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {/* 棚選択 ----------------------------------------------------- */}
      <select
        value={shelfId}
        onChange={(e) => setShelfId(Number(e.target.value))}
        className="w-full rounded border px-3 py-2 bg-white disabled:bg-gray-100"
        required
        disabled={typeof defaultShelf === "number"}
      >
        <option value="" disabled>
          棚を選択してください
        </option>
        {shelves.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>

      {/* 数量 --------------------------------------------------------- */}
      <input
        type="number"
        placeholder="数量"
        value={qty}
        onChange={(e) => setQty(Number(e.target.value))}
        className="w-full rounded border px-3 py-2"
        required
        min={1}
      />

      {/* 操作種別（ラジオ） ------------------------------------------ */}
      <fieldset className="flex gap-6">
        <legend className="sr-only">操作種別</legend>
        <label className="inline-flex items-center gap-1 cursor-pointer">
          <input
            type="radio"
            value="add"
            checked={mode === "add"}
            onChange={() => setMode("add")}
            className="accent-blue-600"
          />
          <span>追加</span>
        </label>
        <label className="inline-flex items-center gap-1 cursor-pointer">
          <input
            type="radio"
            value="use"
            checked={mode === "use"}
            onChange={() => setMode("use")}
            className="accent-red-600"
          />
          <span>使用</span>
        </label>
      </fieldset>

      {/* エラーメッセージ ------------------------------------------- */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* 送信ボタン --------------------------------------------------- */}
      <button
        type="submit"
        disabled={!!error || qty === "" || productId === "" || shelfId === ""}
        className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-40"
      >
        登録
      </button>
    </form>
  );
}
