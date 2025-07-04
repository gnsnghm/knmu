import "./styles/globals.css"; // Tailwind のグローバル
import Header from "@/components/Header";

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
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
