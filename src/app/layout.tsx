import type { Metadata } from "next";
import { Albert_Sans, Geist_Mono, Inter, Lora } from "next/font/google";
import { Providers } from "@/app/providers";
import "./globals.css";

// Alfred Sans stand-in. next/font fetches it at build time and self-hosts it:
// no manual install, no runtime request to Google.
const albertSans = Albert_Sans({
  subsets: ["latin"],
  variable: "--font-albert-sans",
  display: "swap",
});

// Alfred Serif stand-in for paragraph copy.
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

// Inter stays for form controls, labels and nav chrome only.
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
      className={`${albertSans.variable} ${lora.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* Stays a server component. Only `Providers` crosses into the browser. */}
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}