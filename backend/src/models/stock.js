/* eslint-env node */
import { pool } from "../db.js";

export async function listStocks({ q, group, barcode }) {
  let where = [];
  let vals = [];
  if (barcode) {
    vals.push(barcode);
    where.push(`p.barcode = $${vals.length}`);
  }
  if (group) {
    vals.push(group);
    where.push(`p.group_key = $${vals.length}`);
  }
  if (q) {
    vals.push(`${q}%`);
    where.push(`p.name ILIKE $${vals.length}`);
  }
  const clause = where.length ? "WHERE " + where.join(" AND ") : "";
  const sql = `
    SELECT s.*, p.name, p.image_url
      FROM stock s
      JOIN products p ON p.id = s.product_id
      ${clause}
    ORDER BY updated_at DESC LIMIT 100`;
  const { rows } = await pool.query(sql, vals);
  return rows;
}

export async function addOrUpdateStock({
  user_id,
  product_id,
  shelf_id,
  delta,
}) {
  return pool
    .query(
      `INSERT INTO stock (user_id, product_id, shelf_id, quantity)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (user_id, product_id, shelf_id)
       DO UPDATE SET quantity = stock.quantity + $4
       RETURNING *`,
      [user_id, product_id, shelf_id, delta]
    )
    .then((r) => r.rows[0]);
}

export async function upsertStockAbsolute({
  user_id,
  product_id,
  shelf_id,
  quantity,
}) {
  return pool
    .query(
      `INSERT INTO stock (user_id, product_id, shelf_id, quantity)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (user_id, product_id, shelf_id)
       DO UPDATE SET quantity = $4
       RETURNING *`,
      [user_id, product_id, shelf_id, quantity]
    )
    .then((r) => r.rows[0]);
}

export async function createEmptyStock(productId) {
  const existing = await pool.query(
    "SELECT 1 FROM stock WHERE product_id = $1 LIMIT 1",
    [productId]
  );
  if (existing.rowCount > 0) return;

  await pool.query("INSERT INTO stock (product_id, quantity) VALUES ($1, 0)", [
    productId,
  ]);
}
