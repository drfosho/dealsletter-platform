import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Property Analysis - DealSletter',
  description: 'Analyze real estate investment opportunities with AI-powered insights',
};

export default function AnalysisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}