import { pool } from "../db.js";

export const findByBarcode = async (barcode) => {
  const { rows } = await pool.query(
    `SELECT id, barcode, name, brand, group_key, group_id, notify, meta_json, created_at, updated_at,
            COALESCE(image_path, image_url) as image_url
     FROM products WHERE barcode=$1`,
    [barcode]
  );
  return rows[0] ?? null;
};

export const upsertProduct = async (barcode, p) => {
  // Yahoo APIから商品名が取得できなかった場合、バーコードを元に仮の名称を設定する
  // これにより、DBのNOT NULL制約違反を防ぐ
  const productName = p.name || `(名称未設定) ${barcode}`;

  const { rows } = await pool.query(
    `INSERT INTO products (barcode, name, brand, image_url, meta_json, group_key)
       VALUES($1, $2, $3, $4, $5, $6)
     ON CONFLICT(barcode) DO UPDATE
       SET name=EXCLUDED.name, image_url=EXCLUDED.image_url, meta_json=EXCLUDED.meta_json
     RETURNING id, barcode, name, brand, group_key, group_id, notify, meta_json, created_at, updated_at,
               COALESCE(image_path, image_url) as image_url`,
    [barcode, productName, p.brand, p.image, p.meta, p.group]
  );
  return rows[0];
};
export async function findById(id) {
  const res = await pool.query(
    `SELECT id, barcode, name, brand, group_key, group_id, notify, meta_json, created_at, updated_at,
            image_path, COALESCE(image_path, image_url) as image_url
     FROM products WHERE id = $1`,
    [id]
  );
  return res.rows[0] || null;
}

/**
 * 指定されたユーザーIDに紐づく商品一覧を取得します。
 * @returns {Promise<object[]>} 商品の配列
 */
export async function listProducts() {
  const { rows } = await pool.query(
    `SELECT id, barcode, name, brand, group_key, group_id, notify, meta_json, created_at, updated_at,
            COALESCE(image_path, image_url) as image_url
     FROM products ORDER BY updated_at DESC`
  );
  return rows;
}

export async function updateNotify(id, notify) {
  const { rows } = await pool.query(
    `UPDATE products SET notify=$1 WHERE id=$2 RETURNING notify`,
    [notify, id]
  );
  return rows[0] || null;
}
