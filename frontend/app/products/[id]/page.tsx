// frontend/app/products/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { apiGet, apiPut } from "@/lib/api";
import { Button, Input, Label } from "@/lib/form";

type Product = {
  id: number;
  name: string;
  brand: string | null;
};

async function getProduct(id: string) {
  try {
    return await apiGet<Product>(`/api/products/${id}`);
  } catch (err) {
    notFound();
  }
}

async function updateProductAction(formData: FormData) {
  "use server";

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const brand = formData.get("brand") as string;

  try {
    await apiPut(`/api/products/${id}`, { name, brand });
  } catch (err) {
    console.error("Failed to update product:", err);
    // TODO: エラーメッセージをユーザーに表示する
    return;
  }

  revalidatePath("/products");
  redirect("/products");
}

export default async function ProductEditPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  return (
    <form
      action={updateProductAction}
      className="p-4 max-w-md mx-auto space-y-4"
    >
      <h1 className="text-xl font-semibold">商品編集</h1>
      <input type="hidden" name="id" value={product.id} />

      <div>
        <Label htmlFor="name">商品名</Label>
        <Input name="name" id="name" defaultValue={product.name} required />
      </div>

      <div>
        <Label htmlFor="brand">ブランド</Label>
        <Input name="brand" id="brand" defaultValue={product.brand ?? ""} />
      </div>

      <Button>更新</Button>
    </form>
  );
}
