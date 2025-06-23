// backend/src/db.js
import pg from "pg";

export const pool = new pg.Pool({
  connectionString: process.env.PG_URL,
});
