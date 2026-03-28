import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserProvider } from "@/hooks/useUser";
import PlatformProvider from "@/components/PlatformProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Dealsletter - AI-Powered Real Estate Investment Analysis",
    template: "%s | Dealsletter",
  },
  description: "Analyze any property in seconds with AI. Get instant ROI projections, rental estimates, market data, and a clear buy or pass recommendation for rentals, flips, BRRRR, and house hacks.",
  metadataBase: new URL("https://dealsletter.io"),
  manifest: "/manifest.json",
  openGraph: {
    title: "Dealsletter - AI-Powered Real Estate Investment Analysis",
    description: "Analyze any property in seconds with AI. Get instant ROI projections, rental estimates, market data, and a clear buy or pass recommendation.",
    url: "https://dealsletter.io",
    siteName: "Dealsletter",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://dealsletter.io"}/logos/dealsletter-og-banner.png`,
        width: 1200,
        height: 630,
        alt: "Dealsletter - AI-Powered Real Estate Investment Analysis",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dealsletter - AI-Powered Real Estate Investment Analysis",
    description: "Analyze any property in seconds with AI. Get instant ROI projections, rental estimates, and a clear buy or pass recommendation.",
    images: {
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://dealsletter.io"}/logos/dealsletter-og-banner.png`,
      alt: "Dealsletter - AI-Powered Real Estate Investment Analysis platform showing property analysis dashboard",
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Dealsletter",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0a0a0a",
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
        <PlatformProvider>
          <AuthProvider>
            <UserProvider>
              {children}
              <Analytics />
              <SpeedInsights />
            </UserProvider>
          </AuthProvider>
        </PlatformProvider>
      </body>
    </html>
  );
}
