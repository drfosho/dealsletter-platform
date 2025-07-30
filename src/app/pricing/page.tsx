'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';

interface PricingTier {
  id: string;
  name: string;
  icon: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  personalAnalysis: string;
  highlighted?: boolean;
  buttonText: string;
  buttonStyle: string;
}

export default function PricingPage() {
  const { user } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);

  const pricingTiers: PricingTier[] = [
    {
      id: 'basic',
      name: 'BASIC',
      icon: '📊',
      price: isAnnual ? 24 : 29,
      period: 'month',
      description: 'Perfect for getting started with real estate investing',
      personalAnalysis: '0',
      features: [
        'View ALL curated deals (unlimited)',
        'Deal archive and comparison tools',
        'Basic market insights',
        'Email support',
        'Mobile app access'
      ],
      buttonText: 'Get Started',
      buttonStyle: 'bg-muted/20 text-primary hover:bg-muted/30'
    },
    {
      id: 'pro',
      name: 'PRO',
      icon: '🚀',
      price: isAnnual ? 66 : 79,
      period: 'month',
      description: 'Advanced tools for serious investors',
      personalAnalysis: '15 properties/month',
      features: [
        'Everything in Basic',
        'Personal Analysis: 15 properties/month',
        'Advanced analytics dashboard',
        'Deal alerts with filters',
        'PDF exports and sharing',
        'Priority email support',
        'Historical deal data'
      ],
      highlighted: true,
      buttonText: 'Start Pro',
      buttonStyle: 'bg-primary text-secondary hover:bg-primary/90'
    },
    {
      id: 'premium',
      name: 'PREMIUM',
      icon: '💎',
      price: isAnnual ? 166 : 199,
      period: 'month',
      description: 'Complete solution for professional investors',
      personalAnalysis: 'Unlimited',
      features: [
        'Everything in Pro',
        'Personal Analysis: Unlimited',
        'Weekly new deal notifications',
        'Monthly group strategy calls',
        'Phone support',
        'Custom deal sourcing',
        'API access',
        'White-label reports'
      ],
      buttonText: 'Go Premium',
      buttonStyle: 'bg-accent text-white hover:bg-accent/90'
    }
  ];

  const handleSubscribe = (tierId: string) => {
    // TODO: Integrate with Stripe
    console.log(`Subscribe to ${tierId} tier`);
    if (!user) {
      // Redirect to signup with selected plan
      window.location.href = `/auth/signup?plan=${tierId}`;
    } else {
      // Handle subscription for logged-in user
      alert(`Subscription feature coming soon! Selected: ${tierId.toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation variant="default" />

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Choose Your Investment Plan
          </h1>
          <p className="text-xl text-muted mb-8 max-w-3xl mx-auto">
            Get access to curated real estate deals, advanced analytics, and personalized insights. 
            Start building your portfolio today.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mb-12 px-4">
            <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-primary' : 'text-muted'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-muted/30 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
              role="switch"
              aria-checked={isAnnual}
            >
              <span className="sr-only">Toggle annual billing</span>
              <span
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-primary shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isAnnual ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-primary' : 'text-muted'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="ml-2 inline-flex items-center rounded-md bg-green-500/20 px-2.5 py-1 text-xs font-medium text-green-600 whitespace-nowrap">
                Save 17%
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier) => (
              <div
                key={tier.id}
                className={`bg-card rounded-xl border transition-all duration-200 hover:shadow-lg ${
                  tier.highlighted 
                    ? 'border-accent shadow-lg scale-105' 
                    : 'border-border/60 hover:border-accent/50'
                }`}
              >
                {tier.highlighted && (
                  <div className="bg-accent text-white text-center py-3 rounded-t-xl">
                    <span className="text-sm font-semibold">MOST POPULAR</span>
                  </div>
                )}
                
                <div className="p-8">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-2">{tier.icon}</div>
                    <h3 className="text-xl font-bold text-primary mb-2">{tier.name}</h3>
                    <p className="text-sm text-muted mb-4">{tier.description}</p>
                    
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-3xl font-bold text-primary">${tier.price}</span>
                      <span className="text-muted">/{tier.period}</span>
                    </div>
                    
                    {isAnnual && (
                      <p className="text-xs text-green-600">
                        Save ${((tier.price / 0.83) - tier.price).toFixed(0)}/month
                      </p>
                    )}
                  </div>

                  {/* Personal Analysis Highlight */}
                  <div className="bg-muted/10 rounded-lg p-4 mb-6 text-center">
                    <p className="text-sm text-muted mb-1">Personal Analysis</p>
                    <p className="text-lg font-semibold text-primary">{tier.personalAnalysis}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-muted">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSubscribe(tier.id)}
                    className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${tier.buttonStyle}`}
                  >
                    {tier.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/5">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-primary text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-primary mb-2">
                  What&apos;s included in Personal Analysis?
                </h3>
                <p className="text-muted">
                  Detailed financial analysis including cash flow projections, ROI calculations, 
                  cap rates, and investment recommendations tailored to your criteria.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-primary mb-2">
                  Can I upgrade or downgrade anytime?
                </h3>
                <p className="text-muted">
                  Yes! You can change your plan at any time. Upgrades take effect immediately, 
                  and downgrades take effect at your next billing cycle.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-primary mb-2">
                  Is there a free trial?
                </h3>
                <p className="text-muted">
                  We offer a 7-day free trial for all plans. No credit card required to start your trial.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-primary mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-muted">
                  We accept all major credit cards, PayPal, and ACH transfers for annual plans.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-primary mb-2">
                  How often are deals updated?
                </h3>
                <p className="text-muted">
                  Our team curates and adds new deals daily. Premium members get early access 
                  to the best opportunities.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-primary mb-2">
                  Need help choosing a plan?
                </h3>
                <p className="text-muted">
                  Contact our team for a personalized recommendation based on your investment goals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Ready to Start Investing?
          </h2>
          <p className="text-xl text-muted mb-8">
            Join thousands of investors who are building wealth through real estate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/signup" 
              className="px-8 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Start Free Trial
            </Link>
            <Link 
              href="/contact" 
              className="px-8 py-3 bg-muted/20 text-primary rounded-lg hover:bg-muted/30 transition-colors font-medium"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}