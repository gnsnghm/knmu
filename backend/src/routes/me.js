// backend/src/routes/me.js
import { Router } from "express";
import { pool } from "../db.js";
import auth from "../middleware/auth.js";

const router = Router();

/**
 * GET /api/me
 * 認証済みユーザ自身のプロフィールを返す
 *  {
 *    id, email, created_at,
 *    stock_count, product_count
 *  }
 */
router.get("/", auth, async (req, res, next) => {
  try {
    const email = req.user.email;

    const { rows: users } = await pool.query(
      "SELECT id, email, created_at FROM users WHERE email = $1",
      [email]
    );
    if (users.length === 0) return res.status(404).json({ error: "not_found" });

    const user = users[0];

    // 在庫数・商品登録数を集計（OPTIONAL）
    const {
      rows: [{ stock_count, product_count }],
    } = await pool.query(
      `SELECT
         COUNT(s.id)  AS stock_count,
         COUNT(DISTINCT p.id) AS product_count
       FROM stock s
       JOIN products p ON p.id = s.product_id
       WHERE s.user_id = $1`,
      [user.id]
    );

    res.json({ ...user, stock_count, product_count });
  } catch (err) {
    next(err);
  }
});

export default router;
