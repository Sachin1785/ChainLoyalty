import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
});

export const metadata: Metadata = {
  title: "ChainLoyalty | Web3 Loyalty Infrastructure",
  description: "The plug-and-play loyalty layer for Web3 SaaS and Marketplaces.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lexend.variable} font-sans h-full`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
