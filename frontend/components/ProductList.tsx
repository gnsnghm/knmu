// frontend/components/ProductList.tsx
import { apiGet } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { getThumbnailUrl } from "@/lib/getThumbnailUrl";

type Product = {
  id: number;
  name: string;
  brand: string | null;
  image_url: string | null;
  updated_at: string;
};

// サーバーコンポーネントとして商品一覧を取得・表示
export default async function ProductList() {
  const products = await apiGet<Product[]>("/api/products");

  if (products.length === 0) {
    return <p className="text-gray-500">商品はまだ登録されていません。</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b">
          <tr>
            <th scope="col" className="px-4 py-2">
              商品
            </th>
            <th scope="col" className="px-4 py-2">
              ブランド
            </th>
            <th scope="col" className="px-4 py-2 text-right">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b">
              <td className="px-4 py-2 font-medium">
                <div className="flex items-center gap-3">
                  <Image
                    src={
                      getThumbnailUrl(product.image_url) ||
                      product.image_url ||
                      "/img/placeholder.svg"
                    }
                    alt={product.name}
                    width={40}
                    height={40}
                    className="rounded object-cover"
                  />
                  <span>{product.name}</span>
                </div>
              </td>
              <td className="px-4 py-2">{product.brand || "-"}</td>
              <td className="px-4 py-2 text-right">
                <Link
                  href={`/products/${product.id}`}
                  className="text-blue-600 hover:underline"
                >
                  編集
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
