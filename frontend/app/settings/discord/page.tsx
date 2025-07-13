import { redirect } from "next/navigation";
import { apiPost, apiGet } from "@/lib/api";
import { Button, Input, Label } from "@/lib/form";

export const dynamic = "force-dynamic";

type Product = { id: number; name: string; notify: boolean };

async function saveDiscordConfig(formData: FormData) {
  "use server";
  const token = formData.get("token") as string;
  const channelId = formData.get("channelId") as string;

  try {
    await apiPost("/api/discord/config", { token, channelId });
  } catch (err) {
    console.error("Failed to save discord config:", err);
    return;
  }

  redirect("/settings/discord?success=1");
}

async function sendTest() {
  "use server";
  try {
    await apiPost("/api/discord/test", {});
  } catch (err) {
    console.error("Failed to send test message:", err);
    return;
  }

  redirect("/settings/discord?tested=1");
}

export default async function DiscordSettingsPage({
  searchParams,
}: {
  searchParams?: { success?: string; tested?: string };
}) {
  const products = await apiGet<Product[]>("/api/products");
  const notifyProducts = products.filter((p) => p.notify);

  return (
    <div className="p-4 max-w-md mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Discord設定</h1>
      {searchParams?.success && <p className="text-green-600">保存しました</p>}
      {searchParams?.tested && <p className="text-green-600">送信しました</p>}
      <form action={saveDiscordConfig} className="space-y-4">
        <div>
          <Label htmlFor="token">Bot Token</Label>
          <Input id="token" name="token" type="password" required />
        </div>
        <div>
          <Label htmlFor="channelId">Channel ID</Label>
          <Input id="channelId" name="channelId" required />
        </div>
        <Button>保存</Button>
      </form>

      <form action={sendTest}>
        <Button type="submit">テスト送信</Button>
      </form>

      <div>
        <h2 className="text-lg font-semibold">通知対象商品</h2>
        {notifyProducts.length === 0 ? (
          <p className="text-gray-500">通知対象の商品はありません。</p>
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            {notifyProducts.map((p) => (
              <li key={p.id}>
                <a
                  href={`https://www.amazon.co.jp/s?k=${encodeURIComponent(p.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  {p.name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
