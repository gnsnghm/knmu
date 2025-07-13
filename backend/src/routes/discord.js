import express from "express";
import { saveDiscordConfig } from "../models/discordConfig.js";
import { sendDiscordMessage } from "../services/discordNotifier.js";

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

router.post("/test", async (req, res, next) => {
  try {
    const { message } = req.body || {};
    await sendDiscordMessage(message || "テスト送信");
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;

