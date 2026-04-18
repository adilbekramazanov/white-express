import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "White Express — Shipping Label Generator",
  description: "Generate professional A5 shipping labels instantly.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
