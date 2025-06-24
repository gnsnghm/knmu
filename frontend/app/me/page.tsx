import { apiGet } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function Me() {
  const me = await apiGet("/api/me"); // ← backend 側 /me エンドポイント想定
  return (
    <main className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">ユーザ情報</h1>
      <p>メール: {me.email}</p>
      <p>登録日: {new Date(me.created_at).toLocaleDateString()}</p>
    </main>
  );
}
