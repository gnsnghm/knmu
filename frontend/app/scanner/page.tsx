"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException } from "@zxing/library";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * バーコード読み取りページ
 *
 * 動作概要:
 * 1. [カメラを起動] ボタンを押すと getUserMedia 権限を要求し、
 *    ZXing によるバーコード読み取りを開始します。
 * 2. 読み取ったバーコードで製品検索 API (GET /api/products?barcode=xxx)
 *    を呼び出します。
 *    - レスポンスに id が含まれる (＝既登録) 場合 → 在庫数入力画面へ遷移。
 *      （ここでは `/products/{id}/stock` に遷移する想定）
 *    - 404 または空配列の場合 → 新規登録画面へ遷移。
 *      （`/products/new?barcode=xxx` に遷移する想定）
 * 3. 遷移前に reader.reset() でカメラを停止します。
 *
 * 画面を離れたり、読み取りが終わった後は useEffect の cleanup と
 * reader.reset() で必ずカメラストリームを解放します。
 */
export default function ScannerPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  /**
   * ZXing インスタンスの停止（型定義に reset がない古いバージョン対策も兼ねて any キャスト）
   */
  const stopReader = () => {
    (codeReaderRef.current as any)?.reset?.();
  };

  /**
   * カメラ起動 & 1 回だけデコード
   */
  const startScan = () => {
    setMessage(null);
    setStarted(true);
  };

  /**
   * started が true になったタイミングで実際の読み取り処理を開始
   */
  useEffect(() => {
    if (!started || !videoRef.current) return;

    const reader = new BrowserMultiFormatReader();
    codeReaderRef.current = reader;

    const constraints = {
      video: {
        facingMode: { ideal: "environment" },
      },
    } as const;

    reader
      .decodeOnceFromConstraints(constraints, videoRef.current)
      .then(async (result) => {
        const barcode = result.getText();
        stopReader();

        const res = await fetch(
          `/api/products?barcode=${encodeURIComponent(barcode)}`,
          { cache: "no-store" }
        );

        if (res.ok) {
          const data = await res.json();
          if (data && data.id) {
            router.push(`/products/${data.id}/stock`);
            return;
          }
        }

        router.push(`/products/new?barcode=${encodeURIComponent(barcode)}`);
      })
      .catch((err: any) => {
        if (err instanceof NotFoundException) {
          setMessage("バーコードを読み取れませんでした。再度お試しください。");
        } else if (err?.name === "NotAllowedError") {
          setMessage(
            "カメラへのアクセスが拒否されました。ブラウザの設定をご確認ください。"
          );
        } else {
          setMessage(err?.message ?? "予期せぬエラーが発生しました。");
        }
        setStarted(false);
        stopReader();
      });

    return () => {
      stopReader();
    };
  }, [started]);

  // コンポーネントアンマウント時に必ずカメラを停止
  useEffect(() => {
    return () => {
      stopReader();
    };
  }, []);

  return (
    <main className="flex flex-col items-center gap-4 p-4">
      <h1 className="text-xl font-bold">バーコードスキャン</h1>

      {/* 起動前はボタンのみ表示 */}
      {!started && (
        <button
          type="button"
          onClick={startScan}
          className="rounded bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
        >
          カメラを起動
        </button>
      )}

      {/* 読み取り中は video 要素を表示 */}
      {started && (
        <video
          ref={videoRef}
          className="w-full max-w-md rounded-lg border"
          muted
          playsInline
        />
      )}

      {message && <p className="text-red-600">{message}</p>}

      <Link href="/" className="text-blue-600 underline">
        ← 戻る
      </Link>
    </main>
  );
}
