import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Label, Input, Button } from "@/lib/form";
import { apiGet, apiPost, apiPut } from "@/lib/api";
export const dynamic = "force-dynamic";

async function getShelf(id: string) {
  if (id === "new") return { label: "" };
  // apiGetヘルパーを使ってバックエンドからデータを取得
  const list = await apiGet<any[]>("/api/shelves");
  return list.find((g: any) => g.id === Number(id));
}

// Server Action: フォームのデータを受け取り、バックエンドAPIを呼び出す
async function upsertShelfAction(formData: FormData) {
  "use server";

  const id = formData.get("id") as string;
  const label = formData.get("label");
  const isNew = id === "new";

  try {
    if (isNew) {
      await apiPost("/api/shelves", { label });
    } else {
      await apiPut(`/api/shelves/${id}`, { label });
    }
  } catch (err) {
    // TODO: より丁寧なエラーハンドリングを実装
    console.error("Failed to save shelf:", err);
    return;
  }

  revalidatePath("/shelves"); // 棚一覧ページのキャッシュをクリア
  redirect("/shelves"); // 棚一覧ページにリダイレクト
}

export default async function ShelfForm({
  params,
}: {
  params: { id: string };
}) {
  const shelf = await getShelf(params.id);
  if (!shelf) notFound();

  return (
    // formのactionにServer Actionを渡す
    <form action={upsertShelfAction} className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-semibold">
        {params.id === "new" ? "棚新規" : "棚編集"}
      </h1>
      <input type="hidden" name="id" value={params.id} />
      <div>
        <Label htmlFor="label">名称</Label>
        <Input name="label" id="label" defaultValue={shelf.label} required />
      </div>
      <Button>保存</Button>
    </form>
  );
}
