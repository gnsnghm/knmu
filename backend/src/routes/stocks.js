/* eslint-env node */
import express from "express";
import {
  listStocks,
  addOrUpdateStock,
  upsertStockAbsolute,
} from "../models/stock.js";
import { findByBarcode, findById } from "../models/product.js";

const router = express.Router();

/* GET /api/stocks … そのまま */
router.get("/", async (req, res, next) => {
  try {
    const data = await listStocks(req.query);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

/* POST /api/stocks */
router.post("/", async (req, res, next) => {
  try {
    /* --- 1. 新形式: productId + quantity --- */
    if ("productId" in req.body && "quantity" in req.body) {
      const { productId, shelf_id = null, quantity } = req.body;

      if (!Number.isInteger(productId) || productId <= 0)
        return res.status(400).json({ error: "invalid_productId" });
      if (!Number.isFinite(quantity) || quantity < 0)
        return res.status(400).json({ error: "invalid_quantity" });

      /* products に存在するか確認 */
      const p = await findById(productId);
      if (!p) return res.status(404).json({ error: "product_not_found" });

      const stock = await upsertStockAbsolute({
        user_id: req.user?.id ?? 1,
        product_id: productId,
        shelf_id,
        quantity,
      });
      return res.status(201).json(stock);
    }

    /* --- 2. 従来形式: barcode + delta --- */
    const { barcode, shelf_id, delta } = req.body;
    if (!barcode)
      return res.status(400).json({ error: "barcode_or_productId_required" });

    const p = await findByBarcode(barcode);
    if (!p) return res.status(404).json({ error: "product_not_found" });

    const stock = await addOrUpdateStock({
      user_id: req.user?.id ?? 1,
      product_id: p.id,
      shelf_id,
      delta,
    });
    res.status(201).json(stock);
  } catch (e) {
    next(e);
  }
});

export default router;
