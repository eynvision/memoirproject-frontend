// A wrapper file that defines layout elements shared accross webpages
import type { Metadata } from "next";
<<<<<<< Updated upstream
import { Playfair_Display, Inter, Caveat } from "next/font/google";
=======
import { Geist, Geist_Mono } from "next/font/google";
>>>>>>> Stashed changes
import "./globals.css";
import AnnouncementBar from "../components/ui/AnnouncementBar";
import Navbar from "../components/ui/Navbar";

// Configure fonts
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

// Configure Caveat globally to fix the Next.js warning
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-caveat",
});

export const metadata: Metadata = {
<<<<<<< Updated upstream
  title: "Memoir Archive",
  description: "Preserve your life's legacy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${caveat.variable}`}>
      <body className="font-sans antialiased bg-[#FAF8F5] text-[#1D1D1D]">
        <AnnouncementBar />
        <Navbar />
        <main>{children}</main>
=======
  title: "The Memoir Project",
  description: "Create a digital memoir for someone you love.",
};

import AppProviders from "./providers";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Source+Sans+3:ital,wght@0,400;0,600;1,400&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
>>>>>>> Stashed changes
      </body>
    </html>
  );
}
