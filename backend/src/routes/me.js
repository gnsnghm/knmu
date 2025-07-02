// backend/src/routes/me.js
import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

/**
 * GET /api/me
 * 認証済みユーザ自身のプロフィールを返す
 *  {
 *    id, email, created_at,
 *    stock_count, product_count
 *  }
 */
router.get("/", async (req, res, next) => {
  try {
    const email = req.user.email;

    const { rows: users } = await pool.query(
      "SELECT id, email, created_at FROM users WHERE email = $1",
      [email]
    );
    if (users.length === 0) return res.status(404).json({ error: "not_found" });

    const user = users[0];

    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
