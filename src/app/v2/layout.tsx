import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dealsletter \u2014 AI-Powered Real Estate Investment Analysis",
  description:
    "Analyze any real estate deal in 30 seconds. Cap rate, cash flow, ROI \u2014 powered by Claude, GPT-4o & Grok 3.",
  icons: {
    icon: "/logos/favicon-transparent-32.png",
    apple: "/logos/apple-touch-icon-transparent.png",
    shortcut: "/logos/favicon-transparent-32.png",
  },
  openGraph: {
    title: "Dealsletter \u2014 AI-Powered Real Estate Investment Analysis",
    description: "Analyze any real estate deal in 30 seconds. Cap rate, cash flow & ROI powered by Claude, GPT-4o & Grok 3.",
    images: [{ url: "/logos/v2-og-image.png", width: 1200, height: 630, alt: "Dealsletter V2" }],
    type: "website",
    url: "https://dealsletter.io",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dealsletter \u2014 AI Real Estate Analysis",
    description: "Analyze any property in 30 seconds with AI.",
    images: ["/logos/v2-og-image.png"],
    creator: "@KdogBuilds",
  },
};

export default function V2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`
        .v2-root {
          overflow-x: hidden;
          max-width: 100vw;
        }
        *, *::before, *::after {
          box-sizing: border-box;
        }
        @media (max-width: 768px) {
          body {
            overflow-x: hidden;
          }
        }
      `}</style>
      <div className="v2-root">
        {children}
      </div>
    </>
  );
}
