"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";

interface ImageHandlerProps {
  /** 既存の画像のURL（編集時などに使用） */
  initialImageUrl?: string | null;
  /** 新しいファイルが選択されたときに呼び出されるコールバック */
  onFileSelect: (file: File | null) => void;
  /** コンポーネントのサイズ（幅と高さ） */
  size?: number;
  className?: string;
}

/**
 * 画像の選択、プレビュー、アップロードを管理するUIコンポーネント。
 */
export const ImageHandler: React.FC<ImageHandlerProps> = ({
  initialImageUrl,
  onFileSelect,
  size = 128,
  className = "",
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialImageUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      onFileSelect(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`relative cursor-pointer group ${className}`}
      onClick={handleImageClick}
      style={{ width: size, height: size }}
    >
      <Image
        src={previewUrl || "/img/placeholder.svg"}
        alt="アップロードする画像プレビュー"
        width={size}
        height={size}
        className="rounded-md object-cover border w-full h-full"
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/gif"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
        <span className="text-white text-sm font-bold">変更</span>
      </div>
    </div>
  );
};
