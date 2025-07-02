// backend/routes/stocks.js
import express from "express";
import { body, param, validationResult } from "express-validator";
import { pool } from "../db.js";
const router = express.Router();

/* ------------------------------------------------------------------ *
 * POST /api/stocks
 *  在庫の追加 or 使用（負数）
 * ------------------------------------------------------------------ */
router.post(
  "/",
  [
    body("product_id").isInt({ min: 1 }),
    body("shelf_id").isInt({ min: 1 }),
    body("quantity").isInt().not().isEmpty(), // 0 以外の整数
  ],
  async (req, res, next) => {
    try {
      // バリデーション
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });

      const { product_id, shelf_id, quantity } = req.body;
      const client = await pool.connect();

      /* 1) 履歴を残す -------------------------------------------------- */
      const histText =
        "INSERT INTO stock_history (product_id, shelf_id, add_quantity) VALUES ($1,$2,$3)";
      await client.query(histText, [product_id, shelf_id, quantity]);

      /* 2) 在庫を UPSERT  --------------------------------------------- */
      const upsertText = `
        INSERT INTO stock (product_id, shelf_id, add_quantity, total_quantity)
        VALUES ($1, $2, $3, $3)
        ON CONFLICT (product_id, shelf_id) DO UPDATE
          SET add_quantity   = EXCLUDED.add_quantity,
              total_quantity = stock.total_quantity + EXCLUDED.add_quantity,
              updated_at     = NOW()
        WHERE stock.total_quantity + EXCLUDED.add_quantity >= 0
      `;
      const result = await client.query({
        name: "upsert_stock", // Prepared statement 名
        text: upsertText,
        values: [product_id, shelf_id, quantity],
      });

      // WHERE 条件で 0 行更新なら在庫不足
      if (result.rowCount === 0)
        return res.status(409).json({ message: "在庫が不足しています" });

      res.status(201).json({ message: "在庫を更新しました" });
    } catch (err) {
      next(err);
    }
  }
);

/* ------------------------------------------------------------------ *
 * GET /api/stocks
 *  商品×棚ごとの最新在庫一覧
 * ------------------------------------------------------------------ */
router.get("/", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         s.product_id,
         p.name as product_name,
         s.shelf_id,
         sh.label as shelf_label,
         s.total_quantity
       FROM stock s
       JOIN products p ON s.product_id = p.id
       JOIN shelves sh ON s.shelf_id = sh.id
       ORDER BY p.name, sh.label`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------------ *
 * GET /api/stocks/:product_id/:shelf_id
 *  単一レコード取得（フロントのリアルタイム在庫チェック用）
 * ------------------------------------------------------------------ */
router.get(
  "/:product_id/:shelf_id",
  [param("product_id").isInt({ min: 1 }), param("shelf_id").isInt({ min: 1 })],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });

      const { product_id, shelf_id } = req.params;
      const { rows } = await pool.query(
        "SELECT total_quantity FROM stock WHERE product_id=$1 AND shelf_id=$2",
        [product_id, shelf_id]
      );
      if (rows.length === 0) return res.status(404).json({ total_quantity: 0 });
      res.json(rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
