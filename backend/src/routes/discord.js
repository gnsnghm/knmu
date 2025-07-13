import express from "express";
import { saveDiscordConfig } from "../models/discordConfig.js";

const router = express.Router();

router.post("/config", async (req, res, next) => {
  try {
    const { token, channelId } = req.body || {};
    if (!token || !channelId) {
      return res.status(400).json({ error: "invalid_config" });
    }
    await saveDiscordConfig(token, channelId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;

