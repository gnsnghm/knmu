import express from "express";
import cors from "cors";
import auth from "./middleware/auth.js";
import items from "./routes/items.js";
import stocks from "./routes/stocks.js";
import shelves from "./routes/shelves.js";
import groups from "./routes/groups.js";
import meRouter from "./routes/me.js";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(auth);

app.use("/api/items", items);
app.use("/api/stocks", stocks);
app.use("/api/shelves", shelves);
app.use("/api/groups", groups);
app.use("/api/me", meRouter);

app.get("/health", (_, res) => res.send("ok"));
app.listen(3000, () => console.log("API listening on :3000"));
