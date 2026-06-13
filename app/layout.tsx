import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "520 · Year Two — For You",
  description:
    "A cinematic love story — celebrating our second 520 together.",
  openGraph: {
    title: "520 · Year Two — For You",
    description:
      "A cinematic love story — celebrating our second 520 together.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "520 · Year Two — For You",
    description:
      "A cinematic love story — celebrating our second 520 together.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="gradient-cinematic film-grain min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
