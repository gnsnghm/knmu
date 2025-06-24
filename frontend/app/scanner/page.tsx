"use client";
import { useRouter } from "next/navigation";
import { useScanner } from "./useScanner";

export default function ScannerPage() {
  const router = useRouter();
  const ref = useScanner((jan) => router.push(`/products/${jan}`));
  return (
    <main className="flex flex-col items-center p-4">
      <video ref={ref} className="w-full max-w-md aspect-video bg-black" />
      <p className="mt-2 text-center">バーコードをかざしてください…</p>
    </main>
  );
}
