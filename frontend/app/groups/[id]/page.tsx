import { notFound } from "next/navigation";
import { Label, Input, Button } from "@/lib/form";
export const dynamic = "force-dynamic";

async function getGroup(id: string) {
  if (id === "new") return { name: "" };
  const r = await fetch(`/api/groups`, { cache: "no-store" });
  const list = await r.json();
  return list.find((g: any) => g.id === Number(id));
}

export default async function GroupForm({
  params,
}: {
  params: { id: string };
}) {
  const group = await getGroup(params.id);
  if (!group) notFound();

  return (
    <form
      action={`/api/groups${params.id === "new" ? "" : `/${params.id}`}`}
      method="post"
      className="p-4 max-w-md mx-auto space-y-4"
    >
      <h1 className="text-xl font-semibold">
        {params.id === "new" ? "まとめコード新規" : "まとめコード編集"}
      </h1>
      <div>
        <Label>名称</Label>
        <Input name="name" defaultValue={group.name} required />
      </div>
      <Button>保存</Button>
    </form>
  );
}
