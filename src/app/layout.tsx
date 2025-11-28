import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PageTransitionWrapper } from "@/components/layout/PageTransitionWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Farmetrica - Agricultural Data Visualization on East Java",
  description:
    "Farmetrica is an agricultural data visualization platform that provides insights into East Java's farming landscape through satellite imagery and harvest reports.",
};

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="bg-[var(--background)] text-[var(--foreground)]">
          <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 pb-16 pt-8 lg:px-10">
            <Navbar />
            <PageTransitionWrapper>{children}</PageTransitionWrapper>
            <Footer />
          </main>
        </div>
      </body>
    </html>
  );
}
