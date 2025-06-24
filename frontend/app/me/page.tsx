"use client";
import { useEffect, useState } from "react";

export default function Me() {
  const [email, setEmail] = useState("");
  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setEmail(d.email));
  }, []);
  return (
    <main className="p-4">
      <h1 className="text-xl font-semibold">ユーザ情報</h1>
      <p className="mt-2">Email: {email || "loading..."}</p>
    </main>
  );
}
