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
    default: "Dealsletter \u2014 AI-Powered Real Estate Investment Analysis",
    template: "%s | Dealsletter",
  },
  description: "Analyze any real estate deal in 30 seconds. Cap rate, cash flow, ROI \u2014 powered by Claude, GPT-4o & Grok 3.",
  metadataBase: new URL("https://dealsletter.io"),
  manifest: "/manifest.json",
  icons: {
    icon: "/logos/favicon-transparent-32.png",
    apple: "/logos/apple-touch-icon-transparent.png",
    shortcut: "/logos/favicon-transparent-32.png",
  },
  openGraph: {
    title: "Dealsletter \u2014 AI-Powered Real Estate Investment Analysis",
    description: "Analyze any real estate deal in 30 seconds. Cap rate, cash flow & ROI powered by Claude, GPT-4o & Grok 3.",
    url: "https://dealsletter.io",
    siteName: "Dealsletter",
    images: [
      {
        url: "/logos/v2-og-image.png",
        width: 1200,
        height: 630,
        alt: "Dealsletter V2",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dealsletter \u2014 AI Real Estate Analysis",
    description: "Analyze any property in 30 seconds with AI.",
    images: ["/logos/v2-og-image.png"],
    creator: "@KdogBuilds",
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
