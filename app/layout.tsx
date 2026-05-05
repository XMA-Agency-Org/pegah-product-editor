import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pegah — Product Catalog",
  description: "Pegah fine jewellery product review",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-surface">{children}</body>
    </html>
  );
}
