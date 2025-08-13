// frontend/app/products/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import { apiGet, apiPut, apiDelete, apiPatch } from "@/lib/api";
import { Button, Input, Label } from "@/lib/form";
import DeleteProductButton from "@/components/DeleteProductButton";
import { uploadToS3 } from "@/lib/s3";

type Group = { id: number; name: string };

type Product = {
  id: number;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  notify: boolean;
  groupId: number | null;
};

async function getProduct(id: string) {
  try {
    return await apiGet<Product>(`/api/products/${id}`);
  } catch {
    notFound();
  }
}

async function listGroups() {
  return apiGet<Group[]>("/api/groups");
}

async function updateProductAction(formData: FormData) {
  "use server";

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const brand = formData.get("brand") as string;
  const groupIdStr = formData.get("groupId") as string;
  const notify = formData.get("notify") === "on";
  const imageFile = formData.get("image") as File;

  let imageUrl: string | undefined = undefined;

  if (imageFile && imageFile.size > 0) {
    try {
      imageUrl = await uploadToS3(imageFile, id);
    } catch (err) {
      console.error("Failed to upload image:", err);
      // TODO: エラーメッセージをユーザーに表示する
      return;
    }
  }

  try {
    const payload: {
      name: string;
      brand: string;
      imageUrl?: string;
      groupId: number | null;
    } = {
      name,
      brand,
      groupId: groupIdStr ? Number(groupIdStr) : null,
    };
    if (imageUrl) {
      payload.imageUrl = imageUrl;
    }
    await apiPut(`/api/products/${id}`, payload);
    await apiPatch(`/api/products/${id}/notify`, { notify });
  } catch (err) {
    console.error("Failed to update product:", err);
    // TODO: エラーメッセージをユーザーに表示する
    return;
  }

  revalidatePath(`/products/${id}`);
  revalidatePath("/products");
  redirect("/products");
}

async function deleteProduct(id: string) {
  "use server";
  try {
    await apiDelete(`/api/products/${id}`);
  } catch (err) {
    console.error("Failed to delete product:", err);
    // TODO: エラーメッセージをユーザーに表示する
    return;
  }

  revalidatePath("/products");
  revalidatePath("/stocks"); // 在庫一覧も更新
  redirect("/products");
}

export default async function ProductEditPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);
  const groups = await listGroups();
  const deleteProductWithId = deleteProduct.bind(null, params.id);

  // DBから取得したオリジナル画像のURLを元に、サムネイルのURLを生成します。
  // S3に保存した `thumbnail.jpg` を指すようにパスを置換します。
  const thumbnailUrl = product.imageUrl
    ? product.imageUrl.replace(/original\.\w+$/, "thumbnail.jpg")
    : null;

  return (
    <div className="p-4 max-w-md mx-auto space-y-8">
      <form
        action={updateProductAction}
        className="space-y-4"
        encType="multipart/form-data"
      >
        <h1 className="text-xl font-semibold">商品編集</h1>
        <input type="hidden" name="id" value={product.id} />

        <div>
          <Label htmlFor="image">商品画像</Label>
          {thumbnailUrl && (
            <div className="mt-2">
              <Image
                src={thumbnailUrl}
                alt={product.name}
                width={200}
                height={200}
                className="object-cover rounded"
                // 画像が更新されたことをNext.jsに伝えるため、keyにユニークなURLを指定します
                key={product.imageUrl}
              />
            </div>
          )}
          <Input
            type="file"
            name="image"
            id="image"
            accept="image/*"
            className="mt-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div>
          <Label htmlFor="name">商品名</Label>
          <Input name="name" id="name" defaultValue={product.name} required />
        </div>

        <div>
          <Label htmlFor="brand">ブランド</Label>
          <Input name="brand" id="brand" defaultValue={product.brand ?? ""} />
        </div>

        <div>
          <Label htmlFor="groupId">まとめコード</Label>
          <select
            name="groupId"
            id="groupId"
            defaultValue={product.groupId ?? ""}
            className="w-full rounded border px-3 py-2 bg-white"
          >
            <option value="">(未設定)</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            name="notify"
            defaultChecked={product.notify}
            className="accent-blue-600"
          />
          <span>通知</span>
        </label>

        <Button>更新</Button>
      </form>

      <div className="pt-6 border-t border-gray-200">
        <h2 className="text-lg font-semibold text-red-700">危険な操作</h2>
        <p className="text-sm text-gray-600 mt-1 mb-4">
          商品を削除すると、関連するすべての在庫データも削除され、元に戻すことはできません。
        </p>
        <DeleteProductButton handleDelete={deleteProductWithId} />
      </div>
    </div>
  );
}
