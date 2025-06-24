import "./styles/globals.css"; // Tailwind のグローバル

export const metadata = {
  title: "Consumables Manager",
  description: "Household stock tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
