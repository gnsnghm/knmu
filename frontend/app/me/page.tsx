import { apiGet } from "@/lib/api";

export const dynamic = "force-dynamic";

type Me = { email: string; created_at: string };

export default async function Me() {
  const me = await apiGet<Me>("/api/me"); // ← backend 側 /me エンドポイント想定
  return (
    <main className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">ユーザ情報</h1>
      <p>メール: {me.email}</p>
      <p>
        登録日:{" "}
        {new Date(me.created_at).toLocaleString("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })}
      </p>
    </main>
  );
}
