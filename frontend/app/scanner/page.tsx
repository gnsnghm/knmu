"use client";
import { useState } from "react";
import { getItem } from "@/lib/api";
import { useScanner } from "./useScanner";

export default function ScannerPage() {
  const [msg, setMsg] = useState("バーコードをかざしてください");
  const ref = useScanner(async (jan) => {
    try {
      const p = await getItem(jan);
      setMsg(`${p.name}（${p.quantity ?? 0}個）`);
    } catch {
      setMsg("データがありません");
    }
  });

  return (
    <main className="container">
      <video
        ref={ref}
        style={{ width: "100%", height: 280, background: "#000" }}
      />
      <p className="mt-4">{msg}</p>
    </main>
  );
}
