'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import Navigation from '@/components/Navigation'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: 'getting-started' | 'pricing' | 'features' | 'technical' | 'account'
}

const faqData: FAQItem[] = [
  // Getting Started
  {
    id: 'what-is-dealsletter',
    question: "What is Dealsletter?",
    answer: "Dealsletter is an AI-powered property analysis tool that helps real estate investors evaluate investment properties in seconds. Get detailed ROI projections, cash flow analysis, and AI-powered insights for any property address in the US.",
    category: "getting-started"
  },
  {
    id: 'how-to-analyze',
    question: "How do I analyze a property?",
    answer: "Simply enter a property address, select your investment strategy (Fix & Flip, Buy & Hold, BRRRR, House Hack), and customize your financing assumptions. Our AI will generate a comprehensive analysis in about 30 seconds.",
    category: "getting-started"
  },
  {
    id: 'investment-strategies',
    question: "What investment strategies does Dealsletter support?",
    answer: "We support four main strategies: Fix & Flip (buy, renovate, sell), Buy & Hold/Rental (long-term rental income), BRRRR (Buy, Rehab, Rent, Refinance, Repeat), and House Hacking (live in one unit, rent the others).",
    category: "getting-started"
  },
  {
    id: 'who-is-this-for',
    question: "Who is Dealsletter for?",
    answer: "Dealsletter is designed for real estate investors, agents, wholesalers, and anyone looking to analyze investment properties quickly. Whether you're a first-time investor or experienced professional, our tool helps you make data-driven decisions.",
    category: "getting-started"
  },

  // Pricing & Plans
  {
    id: 'free-plan',
    question: "What's included in the Free plan?",
    answer: "Free users get 3 property analyses per month, access to all investment strategies, basic market insights, PDF export, and our educational blog content. No credit card required to start.",
    category: "pricing"
  },
  {
    id: 'pro-plan',
    question: "What's included in the Pro plan?",
    answer: "Pro users ($29/month) get 50 property analyses per month, detailed investment projections, AI-powered investment recommendations, analysis history & comparison tools, PDF export functionality, and priority email support. Pro Plus users ($59/month) get 200 analyses per month plus advanced analytics and early access to new features.",
    category: "pricing"
  },
  {
    id: 'upgrade-downgrade',
    question: "Can I upgrade or downgrade my plan?",
    answer: "Yes, you can upgrade or downgrade anytime from your account settings. When you upgrade, you get immediate access to Pro features. When you downgrade, you keep Pro access until the end of your billing period.",
    category: "pricing"
  },
  {
    id: 'annual-subscription',
    question: "Do you offer annual subscriptions?",
    answer: "Yes! Annual subscriptions save you 20%. Pro is $278/year (save $70), Pro Plus is $566/year (save $142). That's essentially 2 months free!",
    category: "pricing"
  },
  {
    id: 'free-trial',
    question: "Is there a free trial?",
    answer: "Yes! Pro plan includes a 14-day free trial. You also start with 3 free analyses per month on the Free plan - no credit card required to get started analyzing properties.",
    category: "pricing"
  },

  // Analysis Features
  {
    id: 'analysis-data',
    question: "What data does the property analysis include?",
    answer: "Each analysis includes: purchase price estimates, rental income projections, monthly cash flow calculations, ROI and cap rate, detailed expense breakdowns (taxes, insurance, maintenance, vacancy), holding costs, exit strategies, and AI-powered investment recommendations.",
    category: "features"
  },
  {
    id: 'valuation-accuracy',
    question: "How accurate are the property valuations?",
    answer: "We use RentCast API for property data and comparable sales. Valuations are estimates based on market data and should be verified with local market research and professional appraisals before making investment decisions.",
    category: "features"
  },
  {
    id: 'customize-inputs',
    question: "Can I customize the analysis inputs?",
    answer: "Yes! You can customize purchase price, down payment percentage, interest rate, loan terms, renovation costs, expected rental income, and more to match your specific deal parameters.",
    category: "features"
  },
  {
    id: 'ai-recommendation',
    question: "What does the AI recommendation tell me?",
    answer: "Our AI analyzes your property's financials and provides a clear recommendation (Strong Buy, Buy, Hold, or Pass) with specific reasoning based on profit margins, risk factors, cash-on-cash return, and market conditions.",
    category: "features"
  },
  {
    id: 'multi-family',
    question: "Does Dealsletter support multi-family properties?",
    answer: "Yes! We support single-family homes, duplexes, triplexes, fourplexes, and small multi-family properties. The analysis automatically adjusts for multiple units, including per-unit rent calculations.",
    category: "features"
  },

  // Technical Questions
  {
    id: 'markets-supported',
    question: "Which markets/locations are supported?",
    answer: "We support property analysis for addresses across the United States. Market data availability may vary for rural areas, but most metropolitan and suburban areas have comprehensive data coverage.",
    category: "technical"
  },
  {
    id: 'export-analyses',
    question: "Can I export my analyses?",
    answer: "Yes! Both Free and Pro users can export analyses as PDF reports. Pro users also get access to analysis history to compare multiple properties over time.",
    category: "technical"
  },
  {
    id: 'usage-counting',
    question: "How is my analysis usage counted?",
    answer: "Each completed property analysis counts toward your monthly limit. Usage resets on the 1st of each month for Free users, or on your billing anniversary date for Pro subscribers.",
    category: "technical"
  },
  {
    id: 'data-security',
    question: "Is my data secure?",
    answer: "Yes. We use industry-standard encryption and security practices. Your property analyses are private and only visible to you. We never share your data with third parties.",
    category: "technical"
  },

  // Account Management
  {
    id: 'update-payment',
    question: "How do I update my payment method?",
    answer: "Go to Account → Manage Billing to update your payment information through our secure Stripe payment processor. You can update your card, view invoices, and manage your subscription.",
    category: "account"
  },
  {
    id: 'cancel-subscription',
    question: "Can I cancel my subscription?",
    answer: "Yes, you can cancel anytime from your account settings. You'll retain Pro access until the end of your billing period, then automatically revert to the Free plan with 3 analyses per month.",
    category: "account"
  },
  {
    id: 'analyses-after-cancel',
    question: "What happens to my analyses if I cancel?",
    answer: "Your saved analyses remain accessible in your account indefinitely. You'll continue to have 3 free analyses per month on the Free plan and can still view all your historical analyses.",
    category: "account"
  },
  {
    id: 'forgot-password',
    question: "What if I forgot my password?",
    answer: "Click the 'Forgot Password' link on the login page. Enter your email address and we'll send you a reset link. Follow the instructions in the email to create a new password.",
    category: "account"
  }
]

const categories = [
  { key: 'all', label: 'All Questions', icon: '📋' },
  { key: 'getting-started', label: 'Getting Started', icon: '🚀' },
  { key: 'pricing', label: 'Pricing & Plans', icon: '💰' },
  { key: 'features', label: 'Analysis Features', icon: '📊' },
  { key: 'technical', label: 'Technical', icon: '⚙️' },
  { key: 'account', label: 'Account', icon: '👤' }
]

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [openItems, setOpenItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFAQs = useMemo(() => {
    let faqs = selectedCategory === 'all'
      ? faqData
      : faqData.filter(item => item.category === selectedCategory)

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      faqs = faqs.filter(item =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
      )
    }

    return faqs
  }, [selectedCategory, searchQuery])

  const toggleItem = (id: string) => {
    setOpenItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="px-4 py-2 bg-purple-500/10 text-purple-600 rounded-full text-sm font-semibold border border-purple-500/20 inline-block mb-4">
            Help Center
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto mb-8">
            Everything you need to know about Dealsletter property analysis tool. Can&apos;t find what you&apos;re looking for? Contact our support team.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-card border border-border/60 rounded-xl text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
                  selectedCategory === category.key
                    ? 'bg-purple-500/10 text-purple-600 border border-purple-500/30'
                    : 'bg-card text-muted hover:text-primary border border-border/60 hover:border-purple-500/30'
                }`}
              >
                <span>{category.icon}</span>
                <span className="hidden sm:inline">{category.label}</span>
              </button>
            ))}
          </div>

          {/* Results Count */}
          {searchQuery && (
            <p className="text-center text-muted text-sm mb-6">
              Found {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
            </p>
          )}

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq) => (
                <div
                  key={faq.id}
                  id={faq.id}
                  className="bg-card rounded-xl border border-border/60 overflow-hidden hover:border-purple-500/30 transition-colors"
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full p-6 text-left hover:bg-purple-500/5 transition-colors flex items-center justify-between gap-4"
                  >
                    <h3 className="text-lg font-semibold text-primary">
                      {faq.question}
                    </h3>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      openItems.includes(faq.id)
                        ? 'bg-purple-500/10 text-purple-600 rotate-180'
                        : 'bg-muted/10 text-muted'
                    }`}>
                      <svg
                        className="w-5 h-5 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ${
                    openItems.includes(faq.id) ? 'max-h-96' : 'max-h-0'
                  }`}>
                    <div className="px-6 pb-6">
                      <div className="border-t border-border/40 pt-4">
                        <p className="text-muted leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-card rounded-xl border border-border/60">
                <svg className="w-12 h-12 text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-primary mb-2">No results found</h3>
                <p className="text-muted">
                  Try adjusting your search or browse by category
                </p>
              </div>
            )}
          </div>

          {/* Contact CTA */}
          <div className="mt-16 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-2xl border border-purple-500/20 p-8 text-center">
            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-primary mb-3">
              Still have questions?
            </h3>
            <p className="text-muted mb-6 max-w-lg mx-auto">
              Can&apos;t find what you&apos;re looking for? Our support team is here to help with any questions about property analysis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all font-semibold shadow-lg shadow-purple-500/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Support
              </Link>
              <Link
                href="/analysis/new"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-purple-500/30 hover:border-purple-500 text-primary rounded-xl hover:bg-purple-500/5 transition-all font-semibold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Free Analysis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-primary mb-4">Dealsletter</h4>
              <p className="text-sm text-muted">
                AI-powered property analysis for smarter real estate investments.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-primary mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/analysis" className="text-muted hover:text-primary transition-colors">Property Analysis</Link></li>
                <li><Link href="/pricing" className="text-muted hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="/blog" className="text-muted hover:text-primary transition-colors">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-primary mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/faq" className="text-muted hover:text-primary transition-colors">FAQ</Link></li>
                <li><Link href="/contact" className="text-muted hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-primary mb-4">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/auth/login" className="text-muted hover:text-primary transition-colors">Sign In</Link></li>
                <li><Link href="/auth/signup" className="text-muted hover:text-primary transition-colors">Get Started</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/40 pt-8 text-center text-sm text-muted">
            <p>&copy; {new Date().getFullYear()} Dealsletter. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
