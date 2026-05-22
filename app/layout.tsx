import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Scotland Golf Trip 2026",
  description: "Leaderboards & scores for the Scotland golf trip — July 2026",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#f5f5f0]">
        <Navigation />
        <main className="flex-1">{children}</main>
        <footer className="bg-[#1a3c2b] text-white/60 text-xs text-center py-3">
          Scotland Golf Trip · July 2026 · Hotel du Vin St. Andrews
        </footer>
      </body>
    </html>
  );
}
