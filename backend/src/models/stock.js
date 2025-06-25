/* eslint-env node */
import { pool } from "../db.js";

export async function listStocks({ q, group, barcode, product }) {
  let where = [];
  let vals = [];
  const bc = barcode || product;
  if (bc) {
    vals.push(bc);
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
    SELECT s.*, p.name, p.image_url, sh.label AS shelf_label
      FROM stock s
      JOIN products p ON p.id = s.product_id
      LEFT JOIN shelves sh ON sh.id = s.shelf_id
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
  const { rows } = await pool.query(
    `INSERT INTO stock (user_id, product_id, shelf_id, quantity)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (user_id, product_id, shelf_id)
       DO UPDATE SET quantity = stock.quantity + $4
       RETURNING *`,
    [user_id, product_id, shelf_id, delta]
  );
  const stock = rows[0];
  await pool.query(
    `INSERT INTO stock_history (stock_id, delta, after_qty)
       VALUES ($1,$2,$3)`,
    [stock.id, delta, stock.quantity]
  );
  return stock;
}

export async function upsertStockAbsolute({
  user_id,
  product_id,
  shelf_id,
  quantity,
}) {
  const prev = await pool.query(
    `SELECT id, quantity FROM stock WHERE user_id=$1 AND product_id=$2 AND shelf_id IS NOT DISTINCT FROM $3`,
    [user_id, product_id, shelf_id]
  );
  const prevQty = prev.rows[0]?.quantity ?? 0;

  const { rows } = await pool.query(
    `INSERT INTO stock (user_id, product_id, shelf_id, quantity)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (user_id, product_id, shelf_id)
       DO UPDATE SET quantity = $4
       RETURNING *`,
    [user_id, product_id, shelf_id, quantity]
  );
  const stock = rows[0];
  const delta = quantity - prevQty;
  await pool.query(
    `INSERT INTO stock_history (stock_id, delta, after_qty)
       VALUES ($1,$2,$3)`,
    [stock.id, delta, stock.quantity]
  );
  return stock;
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
