import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '贪吃蛇 - Canvas',
  description: '一个使用 Next.js 和 TypeScript 构建的贪吃蛇游戏',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

