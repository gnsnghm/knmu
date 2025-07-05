// backend/routes/products.js
import express from "express";
import { param, validationResult } from "express-validator";
import axios from "axios";
import { fetchByJan } from "../services/yahooService.js";
import {
  findByBarcode,
  findById,
  upsertProduct,
  listProducts,
} from "../models/product.js";
import { uploadImageBufferToS3 } from "../lib/image-handler.js";
import { createInitialStock } from "../models/stock.js";
import { pool } from "../db.js";

// ファイルアップロードをメモリ上で処理するためのMulter設定
const router = express.Router();

/**
 * URLから画像をダウンロードし、S3にアップロードして、DBのimage_pathを更新する
 * @param {object} product - 商品オブジェクト (id, image_url を含む)
 * @returns {Promise<string|null>} S3に保存された画像のパス。失敗した場合はnull
 */
async function downloadAndUploadImage(product) {
  // productオブジェクト、ID、画像URLの存在をチェック
  if (!product?.id || !product.image_url) {
    return null;
  }

  try {
    // 1. URLから画像をダウンロード
    const response = await axios.get(product.image_url, {
      responseType: "arraybuffer", // 画像をバイナリデータとして取得
    });
    const imageBuffer = response.data;
    const mimeType = response.headers["content-type"];

    // 2. S3にアップロード
    const imagePath = await uploadImageBufferToS3(
      imageBuffer,
      mimeType,
      product.id
    );

    // 3. DBのimage_pathを更新
    if (imagePath) {
      await pool.query("UPDATE products SET image_path = $1 WHERE id = $2", [
        imagePath,
        product.id,
      ]);
      return imagePath;
    }
    return null;
  } catch (error) {
    // 画像のダウンロードやアップロードに失敗しても処理は続行させる
    console.error(
      `Failed to process image for product ${product.id} from ${product.image_url}:`,
      error.message
    );
    return null;
  }
}

// 商品をバーコードで検索または作成する共通ロジック
async function findOrCreateProductByBarcode(barcode) {
  let product = await findByBarcode(barcode);
  if (!product) {
    const fetched = await fetchByJan(barcode);
    // Yahoo APIで見つからなくても、バーコード情報だけで商品を登録する
    product = await upsertProduct(barcode, fetched || {});
  }

  // 画像URLがあり、まだS3に保存されていない場合、ダウンロードしてS3に保存
  if (product && product.image_url && !product.image_path) {
    const imagePath = await downloadAndUploadImage(product);
    if (imagePath) {
      // メモリ上のproductオブジェクトを更新して、後続の処理に反映させる
      product.image_path = imagePath;
    }
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

    // レスポンス用にproductオブジェクトを整形
    // image_urlにはS3のパス(image_path)を優先して設定する
    const responseProduct = {
      ...product,
      image_url: product.image_path || product.image_url,
    };

    res.json({ ...responseProduct, shelf_id });
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
    // フロントエンドからS3のURLが imageUrl として渡される
    const { name, brand, imageUrl } = req.body;

    // 1. 更新対象の商品が存在するか確認
    const existingProduct = await findById(id);
    if (!existingProduct) {
      return res.status(404).json({ error: "not_found" });
    }

    // 2. 新しい画像URLが渡されていれば image_path を更新する
    // imageUrl が undefined の場合は既存のパスを維持する
    const imagePath =
      imageUrl !== undefined ? imageUrl : existingProduct.image_path;

    // 3. データベースを更新
    const { rows } = await pool.query(
      `UPDATE products SET name = $1, brand = $2, image_path = $3, updated_at = NOW() 
       WHERE id = $4 
       RETURNING id, name, brand, updated_at, COALESCE(image_path, image_url) as image_url`,
      [name, brand, imagePath, id]
    );

    // findByIdでチェック済みのため、この分岐は通常通らない
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

/* ──────────────────────────────────────────────
 * DELETE /api/products/:id
 *    - 商品の削除 (関連データも削除)
 * ─────────────────────────────────────────── */
router.delete(
  "/:id(\\d+)",
  [param("id").isInt({ min: 1 })],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const id = Number(req.params.id);
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 外部キー制約があるため、関連テーブルから先に削除
      await client.query("DELETE FROM stock_history WHERE product_id = $1", [
        id,
      ]);
      await client.query("DELETE FROM stock WHERE product_id = $1", [id]);
      const result = await client.query("DELETE FROM products WHERE id = $1", [
        id,
      ]);

      if (result.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Product not found" });
      }

      await client.query("COMMIT");
      res.status(204).send(); // 成功、コンテンツなし
    } catch (err) {
      await client.query("ROLLBACK");
      next(err);
    } finally {
      client.release();
    }
  }
);

export default router;
