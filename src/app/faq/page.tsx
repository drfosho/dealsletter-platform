'use client'

import Link from 'next/link'
import Logo from '@/components/Logo'
import { useState } from 'react'

interface FAQItem {
  id: number
  question: string
  answer: string
  category: 'platform' | 'deals' | 'account' | 'pricing'
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "How does the Dealsletter platform work?",
    answer: "Dealsletter provides pre-vetted real estate investment opportunities with detailed financial analysis. Our team sources deals from across the country, performs comprehensive due diligence, and presents them with complete cash flow projections, risk assessments, and investment strategies.",
    category: "platform"
  },
  {
    id: 2,
    question: "What types of real estate deals do you analyze?",
    answer: "We analyze various investment strategies including BRRRR (Buy, Rehab, Rent, Refinance, Repeat), fix-and-flip properties, multifamily investments, and turnkey rentals. Each deal includes detailed analysis for different investment approaches.",
    category: "deals"
  },
  {
    id: 3,
    question: "How often are new deals added to the platform?",
    answer: "We add new deals weekly. Members receive notifications when fresh opportunities matching their investment criteria become available. The platform currently features active deals with updated market analysis.",
    category: "deals"
  },
  {
    id: 4,
    question: "Do I need to verify my email to access deals?",
    answer: "Yes, email verification is required to access the full platform and deal analysis. After signing up, check your email for a verification link. Once verified, you&apos;ll have complete access to the dashboard and all deal details.",
    category: "account"
  },
  {
    id: 5,
    question: "What information is included in each deal analysis?",
    answer: "Each deal includes comprehensive financial analysis: purchase price, renovation costs, projected cash flow, cap rates, ROI calculations, market rent analysis, risk assessment, exit strategies, and detailed property metrics. We also provide neighborhood analysis and investment timeline projections.",
    category: "deals"
  },
  {
    id: 6,
    question: "Can I save and track deals I&apos;m interested in?",
    answer: "Yes, you can save deals to your portfolio for easy tracking. The platform allows you to bookmark properties, take notes, and compare multiple opportunities side-by-side.",
    category: "platform"
  },
  {
    id: 7,
    question: "How do you verify the accuracy of deal information?",
    answer: "Our team performs thorough due diligence including property inspections, market analysis, comparable sales research, and financial modeling. We work with local agents and contractors to ensure accurate renovation estimates and market valuations.",
    category: "deals"
  },
  {
    id: 8,
    question: "What if I forgot my password?",
    answer: "Click the &apos;Forgot Password&apos; link on the login page. Enter your email address and we&apos;ll send you a reset link. Follow the instructions in the email to create a new password and regain access to your account.",
    category: "account"
  },
  {
    id: 9,
    question: "Are there any fees to use the platform?",
    answer: "Currently, the platform is in beta and access is free for early members. We&apos;ll announce any pricing updates well in advance and existing members will receive priority access to new features.",
    category: "pricing"
  },
  {
    id: 10,
    question: "Can I get help with financing these deals?",
    answer: "While we don&apos;t provide financing directly, each deal analysis includes detailed financing scenarios with different loan options. We also provide information about hard money lenders, conventional financing, and creative financing strategies for each property type.",
    category: "deals"
  },
  {
    id: 11,
    question: "How do I update my investor profile preferences?",
    answer: "After logging in, you can update your investment preferences, experience level, budget range, and location preferences from your account settings. This helps us provide more targeted deal recommendations.",
    category: "account"
  },
  {
    id: 12,
    question: "What markets do you focus on?",
    answer: "We analyze opportunities in high-growth markets across the United States, with particular focus on emerging markets with strong job growth, population increases, and favorable investment climates. Current markets include California, Florida, Texas, and other key metropolitan areas.",
    category: "deals"
  }
]

const categories = [
  { key: 'all', label: 'All Questions' },
  { key: 'platform', label: 'Platform' },
  { key: 'deals', label: 'Deals & Analysis' },
  { key: 'account', label: 'Account' },
  { key: 'pricing', label: 'Pricing' }
]

export default function FAQPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [openItems, setOpenItems] = useState<number[]>([])

  const filteredFAQs = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory)

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full px-6 py-3 bg-background/80 backdrop-blur-xl z-50 border-b border-border/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <div className="relative">
                <Logo 
                  width={300}
                  height={75}
                  className="h-12 md:h-16 w-auto"
                  priority
                />
                <div className="absolute top-1 md:top-2 -right-1 w-2 md:w-2.5 h-2 md:h-2.5 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium">
              Home
            </Link>
            <Link href="/contact" className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium">
              Contact
            </Link>
            <Link href="/faq" className="px-6 py-3 text-primary transition-colors font-medium">
              FAQ
            </Link>
            <Link href="/auth/login" className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium">
              Log In
            </Link>
            <Link href="/auth/signup" className="px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium">
              Start Analyzing Deals
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-3 text-primary hover:text-accent transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-6 py-4 bg-background/95 backdrop-blur-xl border-b border-border/20">
              <div className="flex flex-col space-y-3">
                <Link 
                  href="/" 
                  className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center rounded-lg hover:bg-muted/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  href="/blog"
                  className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center rounded-lg hover:bg-muted/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Blog
                </Link>
                <Link 
                  href="/contact"
                  className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center rounded-lg hover:bg-muted/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link 
                  href="/faq"
                  className="px-6 py-3 text-primary transition-colors font-medium min-h-[44px] flex items-center rounded-lg bg-primary/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  FAQ
                </Link>
                <Link 
                  href="/auth/login"
                  className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center rounded-lg hover:bg-muted/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link 
                  href="/auth/signup"
                  className="px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium min-h-[44px] flex items-center justify-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Start Analyzing Deals
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* FAQ Content */}
      <div className="pt-32 px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              Everything you need to know about the Dealsletter platform, deal analysis, and getting started with real estate investing.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  selectedCategory === category.key
                    ? 'bg-accent text-white'
                    : 'bg-card text-muted hover:text-primary border border-border/60'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <div 
                key={faq.id} 
                className="bg-card rounded-xl border border-border/60 overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full p-6 text-left hover:bg-muted/5 transition-colors flex items-center justify-between"
                >
                  <h3 className="text-lg font-semibold text-primary pr-4">
                    {faq.question}
                  </h3>
                  <svg 
                    className={`w-5 h-5 text-muted transition-transform ${
                      openItems.includes(faq.id) ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {openItems.includes(faq.id) && (
                  <div className="px-6 pb-6">
                    <div className="border-t border-border/40 pt-4">
                      <p className="text-muted leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 text-center bg-primary/5 rounded-xl border border-primary/20 p-8">
            <h3 className="text-2xl font-semibold text-primary mb-3">
              Still have questions?
            </h3>
            <p className="text-muted mb-6">
              Can&apos;t find what you&apos;re looking for? Our team is here to help with any questions about the platform or real estate investing.
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <span>Contact Support</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border/20 px-6 py-12">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted">
            © 2024 Dealsletter Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}