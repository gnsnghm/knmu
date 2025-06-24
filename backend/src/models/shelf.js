/* eslint-env node */
import { pool } from "../db.js";

export async function listShelves() {
  const { rows } = await pool.query("SELECT * FROM shelves ORDER BY id");
  return rows;
}

export async function upsertShelf(id, data) {
  const { label } = data;
  const sql = id
    ? "UPDATE shelves SET label=$2 WHERE id=$1 RETURNING *"
    : "INSERT INTO shelves (label) VALUES ($1) RETURNING *";
  const vals = id ? [id, label] : [label];
  return pool.query(sql, vals).then((r) => r.rows[0]);
}
