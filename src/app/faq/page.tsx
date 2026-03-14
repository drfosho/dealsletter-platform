'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import Navigation from '@/components/Navigation'

type FAQCategory = 'search-data' | 'analysis' | 'billing' | 'account'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: FAQCategory
}

const faqData: FAQItem[] = [
  // Property Search & Data
  {
    id: 'what-is-dealsletter',
    question: "What is Dealsletter?",
    answer: "Dealsletter is an AI-powered property analysis tool that helps real estate investors evaluate deals in seconds. Enter any US address and get detailed ROI projections, cash flow analysis, and AI-powered investment recommendations.",
    category: "search-data"
  },
  {
    id: 'cant-find-property',
    question: "What if I can't find a property by address?",
    answer: "We use Google's API to locate properties. If a property doesn't appear, it may not be updated in public records yet. Try searching by a nearby address or just the street name.",
    category: "search-data"
  },
  {
    id: 'data-discrepancy',
    question: "Why does the property data look different from what's listed?",
    answer: "We pull data from multiple sources including public records and AVMs (Automated Valuation Models), so details may differ from current listings. We recommend editing the purchase price to match your actual offer or the listing price.",
    category: "search-data"
  },
  {
    id: 'markets-supported',
    question: "Which markets are supported?",
    answer: "We support property analysis for addresses across the United States. Most metropolitan and suburban areas have comprehensive data, though coverage may be limited in some rural areas.",
    category: "search-data"
  },
  {
    id: 'multi-family',
    question: "Does Dealsletter support multi-family properties?",
    answer: "Yes! We support single-family homes, duplexes, triplexes, fourplexes, and small multi-family properties. The analysis automatically adjusts for multiple units including per-unit rent calculations.",
    category: "search-data"
  },

  // Analysis & Calculations
  {
    id: 'how-to-analyze',
    question: "How do I analyze a property?",
    answer: "Enter a property address, select your investment strategy (Fix & Flip, Buy & Hold, BRRRR, or House Hack), and customize your financing assumptions. Our AI generates a comprehensive analysis in about 30 seconds.",
    category: "analysis"
  },
  {
    id: 'edit-property-details',
    question: "Can I edit property details?",
    answer: "While core property details (beds, baths, sqft) can't be edited, all financial inputs are fully customizable. You can adjust purchase price, down payment, interest rates, loan terms, and renovation costs before running your analysis.",
    category: "analysis"
  },
  {
    id: 'renovation-costs',
    question: "Why are renovation costs automatically filled in?",
    answer: "We provide estimated renovation costs based on the scope of work and average cost per square foot. Since actual costs vary by location, materials, and contractor, we encourage you to input your own estimates — ours are just a starting point.",
    category: "analysis"
  },
  {
    id: 'valuation-accuracy',
    question: "How accurate are the property valuations?",
    answer: "Valuations are estimates based on comparable sales and market data. They should be verified with local market research and professional appraisals before making investment decisions.",
    category: "analysis"
  },
  {
    id: 'ai-recommendation',
    question: "What does the AI recommendation tell me?",
    answer: "Our AI provides a clear recommendation (Strong Buy, Buy, Hold, or Pass) with reasoning based on profit margins, risk factors, cash-on-cash return, and local market conditions.",
    category: "analysis"
  },
  {
    id: 'investment-strategies',
    question: "What investment strategies are supported?",
    answer: "We support four strategies: Fix & Flip (buy, renovate, sell), Buy & Hold (long-term rental income), BRRRR (Buy, Rehab, Rent, Refinance, Repeat), and House Hacking (live in one unit, rent the others).",
    category: "analysis"
  },
  {
    id: 'export-analyses',
    question: "Can I export my analyses?",
    answer: "Yes! You can export any analysis as a PDF report or Excel spreadsheet. Pro users also get full analysis history to compare multiple properties over time.",
    category: "analysis"
  },

  // Subscriptions & Billing
  {
    id: 'free-plan',
    question: "What's included in the Free plan?",
    answer: "Free users get 3 property analyses per month with access to all investment strategies, basic market insights, and PDF export. No credit card required.",
    category: "billing"
  },
  {
    id: 'pro-plan',
    question: "What's included in the Pro plan?",
    answer: "Pro ($29/month) includes 50 analyses per month, AI-powered recommendations, analysis history and comparison tools, and priority support. Pro Plus ($59/month) includes 200 analyses plus advanced analytics.",
    category: "billing"
  },
  {
    id: 'free-trial',
    question: "Is there a free trial?",
    answer: "Yes! The Pro plan includes a 14-day free trial. You also get 3 free analyses per month on the Free plan with no credit card required.",
    category: "billing"
  },
  {
    id: 'upgrade-downgrade',
    question: "Can I upgrade or downgrade my plan?",
    answer: "Yes, you can change plans anytime from your account settings. Upgrades take effect immediately, and downgrades keep your Pro access until the end of your billing period.",
    category: "billing"
  },
  {
    id: 'annual-subscription',
    question: "Do you offer annual subscriptions?",
    answer: "Yes! Annual subscriptions save you 20%. Pro is $278/year and Pro Plus is $566/year — that's roughly 2 months free.",
    category: "billing"
  },
  {
    id: 'usage-counting',
    question: "How is my analysis usage counted?",
    answer: "Each completed property analysis counts toward your monthly limit. Usage resets on the 1st of each month for Free users, or on your billing anniversary for Pro subscribers.",
    category: "billing"
  },

  // Account & Features
  {
    id: 'update-payment',
    question: "How do I update my payment method?",
    answer: "Go to Account > Manage Billing to update your payment info through our secure Stripe processor. You can update your card, view invoices, and manage your subscription from there.",
    category: "account"
  },
  {
    id: 'cancel-subscription',
    question: "Can I cancel my subscription?",
    answer: "Yes, cancel anytime from your account settings. You'll keep Pro access until the end of your billing period, then revert to the Free plan with 3 analyses per month.",
    category: "account"
  },
  {
    id: 'analyses-after-cancel',
    question: "What happens to my analyses if I cancel?",
    answer: "Your saved analyses remain accessible indefinitely. You'll still have 3 free analyses per month and can view all your historical analyses.",
    category: "account"
  },
  {
    id: 'data-security',
    question: "Is my data secure?",
    answer: "Yes. We use industry-standard encryption and security practices. Your analyses are private and only visible to you — we never share your data with third parties.",
    category: "account"
  },
  {
    id: 'forgot-password',
    question: "What if I forgot my password?",
    answer: "Click \"Forgot Password\" on the login page and enter your email. We'll send you a reset link to create a new password.",
    category: "account"
  }
]

const categories = [
  { key: 'all' as const, label: 'All Questions' },
  { key: 'search-data' as const, label: 'Property Search & Data' },
  { key: 'analysis' as const, label: 'Analysis & Calculations' },
  { key: 'billing' as const, label: 'Subscriptions & Billing' },
  { key: 'account' as const, label: 'Account & Features' }
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

  // Group FAQs by category for display
  const groupedFAQs = useMemo(() => {
    if (selectedCategory !== 'all' || searchQuery.trim()) return null

    const groups: { key: FAQCategory; label: string; items: FAQItem[] }[] = []
    for (const cat of categories) {
      if (cat.key === 'all') continue
      const items = faqData.filter(faq => faq.category === cat.key)
      if (items.length > 0) {
        groups.push({ key: cat.key as FAQCategory, label: cat.label, items })
      }
    }
    return groups
  }, [selectedCategory, searchQuery])

  const renderFAQItem = (faq: FAQItem) => (
    <div
      key={faq.id}
      id={faq.id}
      className="bg-card rounded-xl border border-border/60 overflow-hidden hover:border-purple-500/30 transition-colors"
    >
      <button
        onClick={() => toggleItem(faq.id)}
        className="w-full p-5 sm:p-6 text-left hover:bg-purple-500/5 transition-colors flex items-center justify-between gap-4"
      >
        <h3 className="text-base sm:text-lg font-semibold text-primary">
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
        <div className="px-5 sm:px-6 pb-5 sm:pb-6">
          <div className="border-t border-border/40 pt-4">
            <p className="text-muted leading-relaxed">
              {faq.answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="px-4 py-2 bg-purple-500/10 text-purple-600 rounded-full text-sm font-semibold border border-purple-500/20 inline-block mb-4">
            Help Center
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto mb-8">
            Everything you need to know about Dealsletter. Can&apos;t find your answer? Reach out to our support team.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search for answers..."
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
      <section className="px-4 sm:px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-3 sm:px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  selectedCategory === category.key
                    ? 'bg-purple-500/10 text-purple-600 border border-purple-500/30'
                    : 'bg-card text-muted hover:text-primary border border-border/60 hover:border-purple-500/30'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Results Count */}
          {searchQuery && (
            <p className="text-center text-muted text-sm mb-6">
              Found {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
            </p>
          )}

          {/* FAQ Items - grouped by category when showing all */}
          {groupedFAQs ? (
            <div className="space-y-10">
              {groupedFAQs.map((group) => (
                <div key={group.key}>
                  <h2 className="text-xl font-bold text-primary mb-4 pl-1">{group.label}</h2>
                  <div className="space-y-3">
                    {group.items.map(renderFAQItem)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFAQs.length > 0 ? (
                filteredFAQs.map(renderFAQItem)
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
          )}

          {/* Contact CTA */}
          <div className="mt-16 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-2xl border border-purple-500/20 p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-primary mb-3">
              Still have questions?
            </h3>
            <p className="text-muted mb-6 max-w-lg mx-auto">
              Can&apos;t find what you&apos;re looking for? Our support team is here to help.
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
      <footer className="py-12 px-4 sm:px-6 border-t border-border/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
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
              <h4 className="font-semibold text-primary mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="text-muted hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-muted hover:text-primary transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted">
            <p>&copy; {new Date().getFullYear()} Dealsletter. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
