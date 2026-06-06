import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dex Security Cloud",
  description: "MSSP Multi-Tenant Security Console",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
