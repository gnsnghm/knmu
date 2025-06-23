import express from "express";
import { fetchByJan } from "../services/yahooService.js";
import { findByBarcode, upsertProduct } from "../models/product.js";

const router = express.Router();

router.get("/:jan", async (req, res, next) => {
  try {
    const jan = req.params.jan.trim();
    if (!/^\d{8,13}$/.test(jan))
      return res.status(400).json({ error: "invalid_jan" });
    let product = await findByBarcode(jan);
    if (!product) {
      const fetched = await fetchByJan(jan);
      if (!fetched) return res.status(404).json({ error: "not_found" });
      product = await upsertProduct(jan, fetched);
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
});

export default router;
