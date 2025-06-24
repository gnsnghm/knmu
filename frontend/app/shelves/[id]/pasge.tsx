import { notFound } from "next/navigation";
import { Label, Input, Button } from "@/lib/form";
export const dynamic = "force-dynamic";

async function getShelf(id: string) {
  if (id === "new") return { name: "" };
  const r = await fetch(`/api/shelves`, { cache: "no-store" });
  const list = await r.json();
  return list.find((g: any) => g.id === Number(id));
}

export default async function ShelfForm({
  params,
}: {
  params: { id: string };
}) {
  const shelf = await getShelf(params.id);
  if (!shelf) notFound();

  return (
    <form
      action={`/api/shelves${params.id === "new" ? "" : `/${params.id}`}`}
      method="post"
      className="p-4 max-w-md mx-auto space-y-4"
    >
      <h1 className="text-xl font-semibold">
        {params.id === "new" ? "棚新規" : "棚編集"}
      </h1>
      <div>
        <Label>名称</Label>
        <Input name="name" defaultValue={shelf.name} required />
      </div>
      <Button>保存</Button>
    </form>
  );
}
