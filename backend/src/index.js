import express from "express";
import { auth } from "./middleware/auth.js";
import itemRoutes from "./routes/items.js";

const app = express();
app.use(express.json());
app.use(auth);
app.use("/items", itemRoutes);
app.get("/healthz", (_, res) => res.json({ ok: true, ts: Date.now() }));
app.listen(3000, () => console.log("API listening on :3000"));
