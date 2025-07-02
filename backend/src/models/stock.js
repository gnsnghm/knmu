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

/**
 * 在庫を追加または使用し、履歴を記録します。
 * この操作はトランザクション内で実行されます。
 * @param {object} params
 * @param {number} params.product_id - 商品ID
 * @param {number} params.shelf_id - 棚ID
 * @param {number} params.quantity - 追加または使用する数量（使用の場合は負数）
 * @returns {Promise<object>} 更新後の在庫情報
 * @throws {Error} 在庫が不足している場合、またはDBエラーが発生した場合
 */
export async function addStock({ product_id, shelf_id, quantity }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. stock_history に履歴をINSERT
    const historyQuery = `
      INSERT INTO stock_history (product_id, shelf_id, add_quantity)
      VALUES ($1, $2, $3)
    `;
    await client.query(historyQuery, [product_id, shelf_id, quantity]);

    // 2. stock テーブルをUPSERT（INSERTまたはUPDATE）
    const upsertQuery = `
      INSERT INTO stock (product_id, shelf_id, add_quantity, total_quantity)
      VALUES ($1, $2, $3, $3)
      ON CONFLICT (product_id, shelf_id) DO UPDATE
        SET add_quantity   = EXCLUDED.add_quantity,
            total_quantity = stock.total_quantity + EXCLUDED.add_quantity,
            updated_at     = NOW()
      WHERE stock.total_quantity + EXCLUDED.add_quantity >= 0
      RETURNING *
    `;
    const result = await client.query(upsertQuery, [
      product_id,
      shelf_id,
      quantity,
    ]);

    // WHERE句によって更新が0行だった場合は在庫不足
    if (result.rowCount === 0) {
      throw new Error("在庫が不足しています");
    }

    await client.query("COMMIT");
    return result.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err; // エラーを呼び出し元に再スローする
  } finally {
    client.release();
  }
}

/**
 * 商品の初期在庫レコード（数量0）を作成します。
 * 既に何らかの棚に在庫が存在する場合は何もしません。
 * @param {number} productId - 商品ID
 */
export async function createInitialStock(productId) {
  const client = await pool.connect();
  try {
    // 既に在庫レコードが存在するか確認
    const { rowCount: existingStockCount } = await client.query(
      "SELECT 1 FROM stock WHERE product_id = $1 LIMIT 1",
      [productId]
    );
    if (existingStockCount > 0) {
      return; // 既に在庫があるので何もしない
    }

    // 割り当てるための最初の棚を取得
    const { rows: shelves } = await client.query(
      "SELECT id FROM shelves ORDER BY id LIMIT 1"
    );
    if (shelves.length === 0) {
      // 割り当てる棚がない場合は何もしない（ログには残す）
      console.warn(
        `[createInitialStock] No shelves found. Cannot create initial stock for product: ${productId}`
      );
      return;
    }
    const shelfId = shelves[0].id;

    // トランザクション内で在庫と履歴を作成
    await client.query("BEGIN");
    await client.query(
      "INSERT INTO stock (product_id, shelf_id, add_quantity, total_quantity) VALUES ($1, $2, 0, 0)",
      [productId, shelfId]
    );
    await client.query(
      "INSERT INTO stock_history (product_id, shelf_id, add_quantity) VALUES ($1, $2, 0)",
      [productId, shelfId]
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
