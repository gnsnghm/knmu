// backend/routes/products.js
import express from "express";
import { fetchByJan } from "../services/yahooService.js";
import { findByBarcode, findById, upsertProduct } from "../models/product.js";
import { createEmptyStock } from "../models/stock.js";

const router = express.Router();

/* ──────────────────────────────────────────────
 * 1. GET /api/products/:id     ← 具体パスを先に配置
 * ─────────────────────────────────────────── */
router.get("/:id(\\d+)", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const product = await findById(id); // SELECT * FROM products WHERE id = $1
    if (!product) return res.status(404).json({ error: "not_found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

/* ──────────────────────────────────────────────
 * 2. GET /api/products?barcode=xxxxx
 * ─────────────────────────────────────────── */
router.get("/", async (req, res, next) => {
  try {
    const jan = String(req.query.barcode || "").trim();
    if (!/^[0-9]{8,13}$/.test(jan))
      return res.status(400).json({ error: "invalid_jan" });

    let product = await findByBarcode(jan);

    if (!product) {
      const fetched = await fetchByJan(jan); // 取得失敗なら null
      if (!fetched) return res.status(404).json({ error: "not_found" });
      product = await upsertProduct(jan, fetched);
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
});

/* ──────────────────────────────────────────────
 * 3. POST /api/products        { barcode }
 *    - products に upsert
 *    - stocks に在庫 0 行を必ず作成
 * ─────────────────────────────────────────── */
router.post("/", async (req, res, next) => {
  try {
    const { barcode } = req.body || {};
    if (!/^[0-9]{8,13}$/.test(barcode || ""))
      return res.status(400).json({ error: "invalid_barcode" });

    let product = await findByBarcode(barcode);
    if (!product) {
      const fetched = await fetchByJan(barcode);
      product = await upsertProduct(barcode, fetched || {}); // name なしでも作成
    }

    await createEmptyStock(product.id); // 既に行があれば何もしない
    res.json(product);
  } catch (err) {
    next(err);
  }
});

export default router;
