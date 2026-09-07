import type { Metadata } from "next";
import { Fraunces, Geist_Mono, Inter } from "next/font/google";

import { Providers } from "@/app/providers";
import "./globals.css";

// Fraunces for display (self-hosted by next/font), Inter for UI.
// next/font self-hosts and subsets both — no runtime request to Google.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Memoir",
  description:
    "Preserve the stories, photographs, and voices of the people you love.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* Stays a server component. Only `Providers` crosses into the browser. */}
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}