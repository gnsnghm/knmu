"use client";

import { useState, useTransition, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiPost, apiGet } from "@/lib/api";

interface StockFormProps {
  /** products.id (数値) */
  productId: number;
  /** 成功後に遷移する URL。未指定なら `/products/{productId}` */
  redirectTo?: string;
}

/**
 * 在庫数を登録・更新するフォーム (クライアントコンポーネント／TypeScript)
 *
 * 送信形式: { productId, quantity }
 * バックエンドの /api/stocks ルート (id ベース) に合わせています。
 */
export default function StockForm({ productId, redirectTo }: StockFormProps) {
  const [qty, setQty] = useState<number>(1);
  const [shelfId, setShelfId] = useState<number | "" | null>("");
  const [shelves, setShelves] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    apiGet("/api/shelves").then(setShelves).catch(() => {});
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await apiPost("/api/stocks", {
          productId,
          shelf_id: shelfId === "" ? null : shelfId,
          quantity: qty,
        });
        router.push(redirectTo ?? `/products/${productId}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        alert(`登録に失敗しました: ${msg}`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
      <label className="flex flex-col gap-2">
        <span className="font-medium">数量</span>
        <input
          type="number"
          min={0}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="rounded border px-3 py-2"
          required
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="font-medium">棚</span>
        <select
          value={shelfId ?? ""}
          onChange={(e) =>
            setShelfId(e.target.value === "" ? "" : Number(e.target.value))
          }
          className="rounded border px-3 py-2"
        >
          <option value="">(指定なし)</option>
          {shelves.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-green-600 px-4 py-2 font-medium text-white disabled:opacity-50"
      >
        {isPending ? "登録中…" : "登録"}
      </button>
    </form>
  );
}
