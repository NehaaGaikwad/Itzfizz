import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ITZFIZZ — Precision in motion",
  description: "A scroll-driven automotive hero concept for ITZFIZZ.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
