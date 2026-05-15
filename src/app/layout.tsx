import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/Navbar";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "AS AGENCIES | PURE WATER — PURE LIFE",
  description: "Official Kudumbasree Unit providing premium mineral water delivery in Aryanad & Pezhummoodu. BIS Certified quality, 2-hour delivery, and trusted service.",
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${syne.variable} ${dmSans.variable} antialiased water-bg text-slate-900`}>
        <Toaster position="top-center" richColors theme="dark" />
        <AuthProvider>
          <Navbar />
          <main>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
