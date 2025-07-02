import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { apiPost } from "@/lib/api";
import { Button, Input, Label } from "@/lib/form";

async function createProductAction(formData: FormData) {
  "use server";

  const barcode = formData.get("barcode") as string;

  try {
    const product = await apiPost<{ id: number; shelf_id: number }>(
      "/api/products",
      { barcode }
    );

    if (product.id && product.shelf_id) {
      revalidatePath("/stocks");
      revalidatePath("/products");
      redirect(`/stocks/${product.shelf_id}/${product.id}`);
    } else {
      console.error("API did not return expected product data", product);
      redirect("/products");
    }
  } catch (err) {
    console.error("Failed to create product:", err);
    // 400エラー(不正なバーコード)の場合、エラーメッセージ付きでフォームに戻す
    redirect("/products/new?error=invalid_barcode");
  }
}

export default function NewProductPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  return (
    <main className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold">商品手動登録</h1>
      <form action={createProductAction} className="space-y-4">
        <div>
          <Label htmlFor="barcode">JANコード</Label>
          <Input
            name="barcode"
            id="barcode"
            placeholder="13桁または8桁の数字"
            required
            pattern="[0-9]{8,13}"
            title="8桁または13桁のJANコードを入力してください"
          />
        </div>
        {searchParams?.error === "invalid_barcode" && (
          <p className="text-red-500 text-sm">
            無効なバーコードです。8桁または13桁の数字を入力してください。
          </p>
        )}
        <Button>登録して在庫入力へ</Button>
      </form>
    </main>
  );
}
