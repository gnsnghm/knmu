"use client";
import Link from "next/link";

export default function Nav() {
  return (
    <header className="flex justify-between items-center py-2">
      <Link href="/" className="text-xl font-semibold">
        🏠 Home
      </Link>
    </header>
  );
}
