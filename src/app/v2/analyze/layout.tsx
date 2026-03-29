import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analyze Property — Dealsletter",
};

export default function AnalyzeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
