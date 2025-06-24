/* eslint-env node */
import { pool } from "../db.js";

export async function listGroups() {
  const { rows } = await pool.query("SELECT * FROM groups ORDER BY id");
  return rows;
}

export async function upsertGroup(id, data) {
  const { name } = data;
  const sql = id
    ? "UPDATE groups SET name=$2 WHERE id=$1 RETURNING *"
    : "INSERT INTO groups (name) VALUES ($1) RETURNING *";
  const vals = id ? [id, name] : [name];
  return pool.query(sql, vals).then((r) => r.rows[0]);
}
