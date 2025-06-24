/* eslint-env node */
import express from "express";
import { listStocks, addOrUpdateStock } from "../models/stock.js";
import { findByBarcode } from "../models/product.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const data = await listStocks(req.query);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { barcode, shelf_id, delta } = req.body;
    const p = await findByBarcode(barcode);
    if (!p) return res.status(404).json({ error: "product_not_found" });
    const stock = await addOrUpdateStock({
      user_id: req.user.id ?? 1,
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
