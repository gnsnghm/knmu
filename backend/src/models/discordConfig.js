import { pool } from "../db.js";
import crypto from "crypto";

const algorithm = "aes-256-cbc";
const key = (process.env.DISCORD_SECRET_KEY || "").padEnd(32, "0").slice(0, 32);

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

function decrypt(data) {
  const [ivHex, enc] = data.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(enc, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

export async function saveDiscordConfig(token, channelId) {
  const encToken = encrypt(token);
  const encChannel = encrypt(channelId);
  await pool.query("DELETE FROM discord_config");
  await pool.query(
    "INSERT INTO discord_config (encrypted_token, encrypted_channel) VALUES ($1,$2)",
    [encToken, encChannel]
  );
}

export async function loadDiscordConfig() {
  const { rows } = await pool.query(
    "SELECT encrypted_token, encrypted_channel FROM discord_config LIMIT 1"
  );
  if (!rows.length) return null;
  return {
    token: decrypt(rows[0].encrypted_token),
    channelId: decrypt(rows[0].encrypted_channel),
  };
}

