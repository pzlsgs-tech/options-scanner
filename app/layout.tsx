import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Options Scanner | 美股期权筛选与策略推荐",
  description: "扫描美股市场，筛选适合做期权的标的，并给出策略建议",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}