"use client";
import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

export function useScanner(onDetect: (jan: string) => void) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
    ]);
    const reader = new BrowserMultiFormatReader(hints, {
      delayBetweenScanAttempts: 200,
    });
    let controls: IScannerControls | null = null;
    reader.decodeFromVideoDevice(undefined, ref.current!, (res, err, ctl) => {
      if (res) {
        onDetect(res.getText());
        ctl.stop();
      }
      controls = ctl;
    });
    return () => controls?.stop();
  }, [onDetect]);
  return ref;
}
