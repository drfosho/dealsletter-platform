import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dealsletter V2 — AI-Powered Real Estate Analysis",
  description:
    "Analyze any real estate deal with every leading AI model.",
};

export default function V2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
