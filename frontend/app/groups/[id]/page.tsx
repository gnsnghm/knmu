import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Label, Input, Button } from "@/lib/form";
import { apiGet, apiPost, apiPut } from "@/lib/api";
export const dynamic = "force-dynamic";

type Group = { id: number; name: string };

async function getGroup(id: string) {
  if (id === "new") return { name: "" } as Group;
  const list = await apiGet<Group[]>("/api/groups");
  return list.find((g) => g.id === Number(id));
}

// Server Action for creating/updating a group
async function upsertGroupAction(formData: FormData) {
  "use server";

  const id = formData.get("id") as string;
  const name = formData.get("name");
  const isNew = id === "new";

  try {
    if (isNew) {
      await apiPost("/api/groups", { name });
    } else {
      await apiPut(`/api/groups/${id}`, { name });
    }
  } catch (err) {
    // TODO: Implement more robust error handling
    console.error("Failed to save group:", err);
    return;
  }

  revalidatePath("/groups"); // Invalidate cache for the groups list page
  redirect("/groups"); // Redirect to the groups list page
}

export default async function GroupForm({
  params,
}: {
  params: { id: string };
}) {
  const group = await getGroup(params.id);
  if (!group) notFound();

  return (
    <form action={upsertGroupAction} className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-semibold">
        {params.id === "new" ? "まとめコード新規" : "まとめコード編集"}
      </h1>
      <input type="hidden" name="id" value={params.id} />
      <div>
        <Label htmlFor="name">名称</Label>
        <Input name="name" id="name" defaultValue={group.name} required />
      </div>
      <Button>保存</Button>
    </form>
  );
}
