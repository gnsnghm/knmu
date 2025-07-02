// frontend/app/products/page.tsx
import Link from "next/link";
import { Suspense } from "react";
import ProductList from "@/components/ProductList";

export const dynamic = "force-dynamic";

export default async function Products() {
  // ── 将来的に API から商品一覧を取ってくる場合はここで fetch 予定 ──
  return (
    <main className="p-4 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Products</h1>

        {/* ① 手入力での新規登録 */}
        <Link
          href="/products/new"
          className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
        >
          + 手動登録
        </Link>
      </header>

      {/* ② バーコードスキャンでの新規登録 */}
      <Link
        href="/scanner"
        className="block rounded border border-dashed border-gray-400 p-6 text-center hover:bg-gray-50"
      >
        <span role="img" aria-label="barcode" className="mr-2">
          📷
        </span>
        バーコードを読み取って登録
      </Link>

      {/* ③ 商品一覧（データ未取得の間は Skeleton） */}
      <section>
        <Suspense fallback={<p>Loading products…</p>}>
          <ProductList />
        </Suspense>
      </section>
    </main>
  );
}
