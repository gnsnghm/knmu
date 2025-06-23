// backend/src/middleware/auth.js
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import jwkToPem from "jwk-to-pem"; // 既存と同じ
import { pool } from "../db.js";

const team = process.env.CF_TEAM_DOMAIN; // 例: https://xxx.cloudflareaccess.com
const devEmail = process.env.DEV_EMAIL || ""; // 開発用バックドア
const allowlist = (process.env.ALLOW_UNAUTH_HOSTS || "localhost,127.0.0.1")
  .split(",")
  .map((h) => h.trim()); // ← ★ 追加

/** Express 認証ミドルウェア */
export async function auth(req, res, next) {
  /* 1) localhost 系は認証バイパス */
  const host = req.headers.host?.split(":")[0]; // 3000 ポート除去
  if (allowlist.includes(host))
    return saveAndNext(devEmail || "local@example.com", req, next);

  /* 2) Cloudflare Access ヘッダー (推奨) */
  const email = req.headers["cf-access-authenticated-user-email"]; //:contentReference[oaicite:0]{index=0}
  if (email) return saveAndNext(email, req, next);

  /* 3) JWT (Cf-Access-Jwt-Assertion) を検証 */
  const token = req.headers["cf-access-jwt-assertion"]; //:contentReference[oaicite:1]{index=1}
  if (token && team) {
    try {
      const { keys } = await fetch(`${team}/cdn-cgi/access/certs`).then((r) =>
        r.json()
      ); //:contentReference[oaicite:2]{index=2}
      const decoded = jwt.verify(
        token,
        (hdr, cb) => cb(null, jwkToPem(keys.find((k) => k.kid === hdr.kid))),
        { algorithms: ["RS256"], issuer: team }
      );
      return saveAndNext(decoded.email, req, next);
    } catch {
      return res.status(401).json({ error: "invalid_token" });
    }
  }

  /* 4) 開発用メール (DEV_EMAIL) */
  if (devEmail) return saveAndNext(devEmail, req, next);

  /* 5) すべて失敗 → 401 */
  res.status(401).json({ error: "unauthorized" });
}

/* ユーザ保存 + next() 共通処理 */
async function saveAndNext(email, req, next) {
  req.user = { email };
  await pool.query(
    "INSERT INTO users (email) VALUES ($1) ON CONFLICT (email) DO NOTHING",
    [email]
  );
  next();
}
