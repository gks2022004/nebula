import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "NEBULA - Ultra-Low-Latency Live Streaming",
  description: "Stream beyond limits with WebRTC-powered real-time broadcasting • HD Quality • Interactive Chat",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-mono">
        <Providers>
          <div className="min-h-screen bg-[#0a0a0a]">
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
