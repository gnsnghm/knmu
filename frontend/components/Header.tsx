"use client"; // フックを使用するため
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const navItems = [
  { href: "/products", title: "商品", ico: "📦" },
  { href: "/stocks", title: "在庫", ico: "📊" },
  { href: "/shelves", title: "棚", ico: "🗄️" },
  { href: "/groups", title: "まとめ", ico: "🗂️" },
  { href: "/me", title: "ユーザ", ico: "👤" },
];

// .env ファイルからロゴ画像のURLを読み込みます。
const logoImageUrl = process.env.NEXT_PUBLIC_LOGO_IMAGE_URL;

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // ページ遷移時にメニューを閉じる
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      {/* モバイルメニューをposition: absoluteで配置するため、relativeを追加 */}
      <nav className="container mx-auto px-4 py-2 flex justify-between items-center relative">
        {logoImageUrl ? (
          // 環境変数にロゴ画像URLが設定されている場合
          <Link href="/" className="flex items-center h-8">
            <Image
              src={logoImageUrl}
              alt="Consumables Manager Logo"
              height={32} // 親要素の h-8 (2rem = 32px) に合わせる
              width={160} // 画像の縦横比に合わせて調整してください (例: 5:1なら 32*5=160)
              style={{ width: "auto", height: "100%" }}
              priority // LCP(Largest Contentful Paint)のため優先的に読み込む
            />
          </Link>
        ) : (
          // ロゴ画像が設定されていない場合はテキストを表示
          <Link
            href="/"
            className="text-2xl font-bold text-gray-800 hover:text-blue-600 flex items-center h-8"
          >
            KNMU
          </Link>
        )}

        {/* PC用ナビゲーション (md以上で表示) */}
        <ul className="hidden md:flex items-center space-x-2 sm:space-x-4">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const activeClass = isActive
              ? "bg-blue-100 text-blue-700"
              : "text-gray-600 hover:bg-gray-100 hover:text-blue-600";
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={item.title}
                  className={`p-2 rounded-md flex items-center space-x-2 transition-colors duration-200 ${activeClass}`}
                >
                  <span className="text-xl">{item.ico}</span>
                  <span className="hidden sm:inline text-sm font-medium">
                    {item.title}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* ハンバーガーメニューボタン (md未満で表示) */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            aria-label="メインメニューを開閉する"
          >
            {isOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            )}
          </button>
        </div>

        {/* モバイル用ドロップダウンメニュー */}
        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-lg md:hidden">
            <ul className="flex flex-col p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const activeClass = isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100";
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`w-full flex items-center space-x-4 p-3 rounded-md transition-colors duration-200 ${activeClass}`}
                    >
                      <span className="text-2xl">{item.ico}</span>
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}
