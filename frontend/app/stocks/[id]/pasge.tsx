import { notFound } from "next/navigation";
import { Label, Input, Button } from "@/lib/form";

async function getStock(id: string) {
  const r = await fetch(`/api/stocks?id=${id}`, { cache: "no-store" });
  const list = await r.json();
  return list.find((s: any) => s.id === Number(id));
}

export default async function StockEdit({
  params,
}: {
  params: { id: string };
}) {
  const stock = await getStock(params.id);
  if (!stock) notFound();

  return (
    <form
      action={`/api/stocks/${stock.id}`}
      method="post"
      className="p-4 max-w-md mx-auto space-y-4"
    >
      <h1 className="text-xl font-semibold">在庫更新</h1>
      <p>{stock.name}</p>
      <div>
        <Label>数量 (+/-)</Label>
        <Input type="number" name="delta" required />
      </div>
      <Button>更新</Button>
    </form>
  );
}
