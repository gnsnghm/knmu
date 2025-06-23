const ENDPOINT =
  "https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch";
export async function fetchByJan(jan) {
  const url = new URL(ENDPOINT);
  url.searchParams.set("appid", process.env.YAHOO_APP_ID);
  url.searchParams.set("jan_code", jan);
  url.searchParams.set("in_stock", "false");
  url.searchParams.set("results", "1");
  const res = await fetch(url);
  if (!res.ok) throw new Error("Yahoo API");
  const data = await res.json();
  if (!data.totalResultsReturned) return null;
  const hit = data.hits[0];
  return {
    name: hit.name,
    brand: hit.brand?.name ?? null,
    image: hit.image?.medium,
    meta: hit,
    group: hit.genreCategory?.name?.toLowerCase().replace(/\s+/g, "-") ?? null,
  };
}
