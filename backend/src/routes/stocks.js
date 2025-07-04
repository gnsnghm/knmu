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
    body("quantity")
      .isInt()
      .custom((value) => {
        if (value === 0) {
          throw new Error("数量には0以外の整数を指定してください");
        }
        return true;
      }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { product_id, shelf_id, quantity } = req.body;
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      /* 1) 履歴を残す -------------------------------------------------- */
      const histText =
        "INSERT INTO stock_history (product_id, shelf_id, add_quantity) VALUES ($1,$2,$3)";
      await client.query(histText, [product_id, shelf_id, quantity]);

      let result;
      // 在庫を追加する場合 (quantity > 0)
      if (quantity > 0) {
        const upsertText = `
          INSERT INTO stock (product_id, shelf_id, add_quantity, total_quantity)
          VALUES ($1, $2, $3, $3)
          ON CONFLICT (product_id, shelf_id) DO UPDATE
            SET add_quantity   = EXCLUDED.add_quantity,
                total_quantity = stock.total_quantity + EXCLUDED.add_quantity,
                updated_at     = NOW()`;
        result = await client.query(upsertText, [
          product_id,
          shelf_id,
          quantity,
        ]);
      }
      // 在庫を使用する場合 (quantity < 0)
      else {
        const updateText = `
          UPDATE stock
          SET add_quantity   = $3,
              total_quantity = stock.total_quantity + $3,
              updated_at     = NOW()
          WHERE product_id = $1 AND shelf_id = $2
            AND stock.total_quantity + $3 >= 0`;
        result = await client.query(updateText, [
          product_id,
          shelf_id,
          quantity,
        ]);
      }

      // 在庫使用時に更新行数が0だった場合は、在庫がなかったか不足していたということ
      if (quantity < 0 && result.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(409).json({ message: "在庫が不足しています" });
      }

      await client.query("COMMIT");
      res.status(201).json({ message: "在庫を更新しました" });
    } catch (err) {
      await client.query("ROLLBACK");
      next(err);
    } finally {
      client.release();
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
         s.total_quantity,
         COALESCE(p.image_path, p.image_url) as image_url
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
