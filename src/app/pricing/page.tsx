'use client';

import Navigation from '@/components/Navigation';
import PricingComparison from '@/components/PricingComparison';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PricingComparison />
    </div>
  );
}