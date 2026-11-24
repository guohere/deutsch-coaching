import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#18181b",
};

export const metadata: Metadata = {
  title: "SprachCoach — Proactive AI German Speaking Coach",
  description:
    "Personalized, editable German speaking plans, guided voice-first conversations, and persistent bottleneck memory for Goethe & CEFR mastery.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SprachCoach",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-dvh bg-[#f8f6f2] text-zinc-900 antialiased"
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
