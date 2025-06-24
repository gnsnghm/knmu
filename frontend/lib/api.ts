export async function getItem(jan: string) {
  const r = await fetch(`/api/items/${jan}`, { credentials: "include" });
  if (r.status === 404) throw new Error("not_found");
  if (!r.ok) throw new Error("server");
  return r.json();
}
