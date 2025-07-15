import fetch from "node-fetch";
import { load } from "cheerio";
import { pool } from "../db.js";
import { loadDiscordConfig } from "../models/discordConfig.js";

export async function searchAmazon(name) {
  const url = `https://www.amazon.co.jp/s?k=${encodeURIComponent(name)}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) throw new Error("amazon fetch failed");
    const html = await res.text();
    const $ = load(html);
    const priceText = $("span.a-price-whole").first().text().replace(/[^0-9]/g, "");
    const price = priceText ? Number(priceText) : null;
    return { price, url };
  } catch (e) {
    console.error(e);
    return { price: null, url };
  }
}

export async function sendDiscordMessage(message) {
  const conf = await loadDiscordConfig();
  if (!conf) return;
  const url = `https://discord.com/api/channels/${conf.channelId}/messages`;
  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bot ${conf.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: message }),
  });
}

export async function checkAndNotify() {
  const { rows: products } = await pool.query(`
      SELECT p.id, p.name,
             COALESCE(SUM(s.total_quantity),0) AS qty,
             (SELECT MAX(created_at) FROM stock_history sh WHERE sh.product_id = p.id AND sh.add_quantity > 0) AS last_added,
             (SELECT COUNT(*) FROM stock_history sh WHERE sh.product_id = p.id) AS history_count
        FROM products p
        LEFT JOIN stock s ON s.product_id = p.id
       WHERE p.notify = true
       GROUP BY p.id
  `);

  const notices = [];

  for (const p of products) {
    if (p.history_count < 2) continue;
    if (Number(p.qty) > 1) continue;

    const { rows: logs } = await pool.query(
      "SELECT 1 FROM notification_logs WHERE product_id=$1 AND sent_at >= NOW() - INTERVAL '7 days'",
      [p.id]
    );
    if (logs.length) continue;

    const result = await searchAmazon(p.name);
    const date = p.last_added ? new Date(p.last_added).toISOString().split("T")[0] : "-";
    notices.push({
      id: p.id,
      name: p.name,
      qty: p.qty,
      date,
      price: result.price,
      url: result.url,
    });
  }

  if (!notices.length) return;

  let message = "以下の商品の在庫が1以下になりました。\n";
  for (const n of notices) {
    const price = n.price ? `${n.price}円` : "価格不明";
    message += `# ${n.name}\n- 在庫数：${n.qty}\n- 最終追加日：${n.date}\n- ネットショッピング価格：[${price}](${n.url})\n\n`;
    await pool.query(
      "INSERT INTO notification_logs (product_id, sent_at) VALUES ($1, NOW())",
      [n.id]
    );
  }

  await sendDiscordMessage(message.trim());
}

export function scheduleDailyNotifications() {
  const day = 24 * 60 * 60 * 1000;
  setInterval(checkAndNotify, day);
  checkAndNotify();
}

