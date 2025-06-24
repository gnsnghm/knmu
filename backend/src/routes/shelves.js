/* eslint-env node */
import express from "express";
import { listShelves, upsertShelf } from "../models/shelf.js";

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    res.json(await listShelves());
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    res.status(201).json(await upsertShelf(null, req.body));
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    res.json(await upsertShelf(req.params.id, req.body));
  } catch (e) {
    next(e);
  }
});

export default router;
