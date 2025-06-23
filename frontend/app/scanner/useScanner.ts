"use client";
import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import { DecodeHintType, BarcodeFormat } from "@zxing/library";

export function useScanner(onDetect: (code: string) => void) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    /* 1) 読み取りヒント */
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
    ]);

    /* 2) options オブジェクトを渡す（500ms 間隔） */
    const reader = new BrowserMultiFormatReader(hints, {
      delayBetweenScanAttempts: 500,
    });

    let controls: IScannerControls | null = null;

    reader
      .decodeFromVideoDevice(
        undefined, // 自動で背面カメラ
        videoRef.current!,
        (result, err, ctl) => {
          if (result) {
            onDetect(result.getText());
            ctl.stop(); // ZXing では reset() ではなく stop()
          }
          controls = ctl;
        }
      )
      .catch(console.error);

    /* 3) アンマウント時にカメラを解放 */
    return () => controls?.stop();
  }, [onDetect]);

  return videoRef;
}
