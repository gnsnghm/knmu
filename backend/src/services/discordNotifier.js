import fetch from "node-fetch";
import { pool } from "../db.js";
import { loadDiscordConfig } from "../models/discordConfig.js";

export async function searchAmazon(name) {
  // Amazon API placeholder
  return {
    url: `https://www.amazon.co.jp/s?k=${encodeURIComponent(name)}`,
  };
}

async function sendDiscord(message) {
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
             (SELECT MAX(created_at) FROM stock_history sh WHERE sh.product_id = p.id) AS last_added
        FROM products p
        LEFT JOIN stock s ON s.product_id = p.id
       WHERE p.notify = true
       GROUP BY p.id
  `);

  for (const p of products) {
    const { rows: logs } = await pool.query(
      "SELECT 1 FROM notification_logs WHERE product_id=$1 AND sent_at >= NOW() - INTERVAL '7 days'",
      [p.id]
    );
    if (logs.length) continue;

    const result = await searchAmazon(p.name);
    const url = result?.url || "";
    const date = p.last_added ? new Date(p.last_added).toISOString().split("T")[0] : "-";
    const message = `商品: ${p.name}\n在庫数: ${p.qty}\n最終追加: ${date}\n${url}`;
    await sendDiscord(message);
    await pool.query(
      "INSERT INTO notification_logs (product_id, sent_at) VALUES ($1, NOW())",
      [p.id]
    );
  }
}

export function scheduleDailyNotifications() {
  const day = 24 * 60 * 60 * 1000;
  setInterval(checkAndNotify, day);
  checkAndNotify();
}

