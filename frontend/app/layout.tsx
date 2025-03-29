import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Web3Provider } from './providers/Web3Provider';
import Moralis from 'moralis';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Floquidity - DeFi Portfolio Optimizer",
  description: "AI-powered DeFi portfolio management across multiple chains",
};

// Initialize Moralis on the server side
if (process.env.NEXT_PUBLIC_MORALIS_API_KEY) {
  Moralis.start({
    apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
  });
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}