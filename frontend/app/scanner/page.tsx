"use client";
import { useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import Link from "next/link";

export default function Scanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const startCamera = async () => {
    setMessage(null);
    setStarted(true);
    try {
      const codeReader = new BrowserMultiFormatReader();
      const result = await codeReader.decodeOnceFromVideoDevice(
        undefined, // デフォルトカメラ
        videoRef.current!
      );
      window.location.href = `/products/${result.getText()}`;
    } catch (err: any) {
      setMessage(err?.message ?? "camera_error");
      setStarted(false);
    }
  };

  return (
    <main className="p-4 flex flex-col gap-4 items-center">
      <h1 className="text-xl font-bold">バーコードスキャン</h1>

      {!started && (
        <button
          onClick={startCamera}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          カメラを起動
        </button>
      )}

      {message && <p className="text-red-600">{message}</p>}

      <video
        ref={videoRef}
        className="w-full max-w-md rounded shadow"
        autoPlay
        muted
        playsInline
      />

      <Link href="/" className="text-blue-600 underline">
        ← 戻る
      </Link>
    </main>
  );
}
