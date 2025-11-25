import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "NEBULA ✨ Live Streaming",
  description: "Stream beyond limits with WebRTC-powered real-time broadcasting • HD Quality • Interactive Chat",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Patrick+Hand&family=Shadows+Into+Light&display=swap" rel="stylesheet" />
      </head>
      <body className="font-hand" suppressHydrationWarning>
        <Providers>
          <div className="min-h-screen bg-transparent">
            <Navbar />
            <main>
              {children}
            </main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
