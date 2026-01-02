import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
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
  title: "Missed Call ROI Calculator | Revaya AI",
  description: "Calculate how much revenue you're losing from missed calls and discover how AI voice agents can help.",
};

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
        {children}
        <Script id="iframe-resize" strategy="afterInteractive">
          {`
            (function() {
              function sendHeight() {
                const height = Math.max(
                  document.body.scrollHeight,
                  document.documentElement.scrollHeight,
                  document.body.offsetHeight,
                  document.documentElement.offsetHeight
                );

                window.parent.postMessage({
                  type: 'calculatorResize',
                  height: height + 50
                }, '*');
              }

              // Send on load
              if (document.readyState === 'complete') {
                sendHeight();
              } else {
                window.addEventListener('load', sendHeight);
              }

              // Send on DOM changes
              const observer = new MutationObserver(function() {
                setTimeout(sendHeight, 100);
              });

              observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true
              });

              // Send periodically for first 3 seconds (catches React renders)
              let ticks = 0;
              const interval = setInterval(function() {
                sendHeight();
                ticks++;
                if (ticks > 6) clearInterval(interval);
              }, 500);

              // Send on resize
              window.addEventListener('resize', sendHeight);
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
