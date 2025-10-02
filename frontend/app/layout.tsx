import type { ReactNode } from "react";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-dvh bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
