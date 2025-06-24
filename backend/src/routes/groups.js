/* eslint-env node */
import express from "express";
import { listGroups, upsertGroup } from "../models/group.js";

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    res.json(await listGroups());
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    res.status(201).json(await upsertGroup(null, req.body));
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    res.json(await upsertGroup(req.params.id, req.body));
  } catch (e) {
    next(e);
  }
});

export default router;
