'use client';

import { useEffect } from "react";
import localFont from "next/font/local";
import "./globals.css";
import { notifyParentOfHeight } from "@/lib/iframe-utils";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Disable all auto-scroll behavior when in iframe
  useEffect(() => {
    // Disable scroll restoration
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
    }

    // Prevent any scroll behavior when in iframe
    if (window.self !== window.top) {
      const originalScrollTo = window.scrollTo;
      window.scrollTo = () => {}; // Disable scrollTo when in iframe

      return () => {
        window.scrollTo = originalScrollTo; // Restore on cleanup
      };
    }
  }, []);

  // A) Initial page load - send height after mount
  useEffect(() => {
    notifyParentOfHeight();

    // Also send after short delays to catch delayed renders
    setTimeout(notifyParentOfHeight, 500);
    setTimeout(notifyParentOfHeight, 1000);
  }, []);

  // D) Window resize listener
  useEffect(() => {
    window.addEventListener('resize', notifyParentOfHeight);
    return () => window.removeEventListener('resize', notifyParentOfHeight);
  }, []);

  return (
    <html lang="en">
      <head>
        <title>Missed Call ROI Calculator | Revaya AI</title>
        <meta name="description" content="Calculate how much revenue you're losing from missed calls and discover how AI voice agents can help." />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
