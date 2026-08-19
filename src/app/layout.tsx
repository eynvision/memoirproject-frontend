// A wrapper file that defines layout elements shared accross webpages
import type { Metadata } from "next";
import { Playfair_Display, Caveat, Inter } from "next/font/google";
import "./globals.css";
import AnnouncementBar from "../components/ui/AnnouncementBar";
import Navbar from "../components/ui/Navbar";
import "./globals.css";

// Configure fonts
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Memoir Archive",
  description: "Preserve your life's legacy.",
};

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-[#FAF8F5] text-[#1D1D1D]">
        <AnnouncementBar />
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}