import type { Metadata } from "next";
import { Inter, Noto_Color_Emoji, Patrick_Hand, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
// Fallback so emoji (incl. flags, which Windows lacks) render the same everywhere.
// Split by unicode-range, so browsers only download the emoji a page uses.
// Handwriting for the demo's comic panels.
const hand = Patrick_Hand({ weight: "400", subsets: ["latin"], variable: "--font-hand" });
const emoji = Noto_Color_Emoji({ weight: "400", subsets: ["emoji"], variable: "--font-emoji", preload: false });

export const metadata: Metadata = {
  title: "Heads-Up by Kate",
  description: "Heads-Up: your bank warns you before things go wrong, and explains why.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${grotesk.variable} ${emoji.variable} ${hand.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
