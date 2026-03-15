import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/shared/Toaster";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "GitPM — Portfolio platform for PMs who build",
    template: "%s | GitPM",
  },
  description:
    "The portfolio platform for product managers who build with AI coding tools. Aggregate your shipped projects with OAuth-verified deployment badges.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark`}
    >
      <body className="bg-navy text-foreground antialiased font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
