// backend/routes/products.js
import express from "express";
import { fetchByJan } from "../services/yahooService.js";
import {
  findByBarcode,
  findById,
  upsertProduct,
  listProducts,
} from "../models/product.js";
import { createInitialStock } from "../models/stock.js";
import { pool } from "../db.js";

const router = express.Router();

// 商品をバーコードで検索または作成する共通ロジック
async function findOrCreateProductByBarcode(barcode) {
  let product = await findByBarcode(barcode);
  if (!product) {
    const fetched = await fetchByJan(barcode);
    // Yahoo APIで見つからなくても、バーコード情報だけで商品を登録する
    product = await upsertProduct(barcode, fetched || {});
  }
  return product;
}

// バーコードを処理して商品情報とリダイレクト先の棚IDを返す共通ハンドラ
async function handleBarcodeRequest(barcode, res, next) {
  try {
    if (!/^[0-9]{8,13}$/.test(barcode || ""))
      return res.status(400).json({ error: "invalid_barcode" });

    const product = await findOrCreateProductByBarcode(barcode);
    if (!product) {
      // このケースはupsertProductがnullを返さない限り発生しないが、念のため
      return res.status(404).json({ error: "not_found" });
    }

    // 商品に在庫レコードがなければ、最初の棚に在庫0で作成する
    await createInitialStock(product.id);

    // リダイレクト先の棚IDを取得 (最新更新 or 最初の棚)
    const { rows } = await pool.query(
      `SELECT shelf_id FROM stock WHERE product_id = $1 ORDER BY updated_at DESC, shelf_id ASC LIMIT 1`,
      [product.id]
    );

    // createInitialStock が実行されるので、棚は必ず存在するはず
    const shelf_id = rows[0]?.shelf_id;

    // productオブジェクトとshelf_idをマージして返す
    res.json({ ...product, shelf_id });
  } catch (err) {
    next(err);
  }
}

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
 * PUT /api/products/:id
 *    - 商品情報の更新
 * ─────────────────────────────────────────── */
router.put("/:id(\\d+)", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name, brand } = req.body;

    const { rows } = await pool.query(
      "UPDATE products SET name = $1, brand = $2, updated_at = NOW() WHERE id = $3 RETURNING *",
      [name, brand, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "not_found" });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/* ──────────────────────────────────────────────
 * GET /api/products
 * ─────────────────────────────────────────── */
router.get("/", async (req, res, next) => {
  // 'barcode'クエリパラメータが存在し、かつ空でない文字列の場合のみバーコードリクエストとして扱う
  if (
    Object.prototype.hasOwnProperty.call(req.query, "barcode") &&
    typeof req.query.barcode === "string" &&
    req.query.barcode.trim() !== ""
  ) {
    const jan = req.query.barcode.trim();
    return handleBarcodeRequest(jan, res, next);
  }

  // それ以外は商品一覧取得リクエストとして扱う
  try {
    const products = await listProducts();
    res.json(products);
  } catch (err) {
    next(err);
  }
});

/* ──────────────────────────────────────────────
 * POST /api/products        { barcode }
 * ─────────────────────────────────────────── */
router.post("/", (req, res, next) => {
  const { barcode } = req.body || {};
  handleBarcodeRequest(barcode, res, next);
});

export default router;
