'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full px-6 py-3 bg-background/80 backdrop-blur-xl z-50 border-b border-border/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <div className="relative">
                <Image 
                  src="/logos/Footer2.svg" 
                  alt="Dealsletter Logo" 
                  width={400}
                  height={100}
                  className="h-16 md:h-20 w-auto"
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
            <Link href="/contact" className="px-6 py-3 text-primary transition-colors font-medium">
              Contact
            </Link>
            <Link href="/faq" className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium">
              FAQ
            </Link>
            <Link href="/auth/login" className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium">
              Log In
            </Link>
            <Link href="/auth/signup" className="px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium">
              Start Analyzing Deals
            </Link>
          </div>
        </div>
      </nav>

      {/* Contact Content */}
      <div className="pt-32 px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Get in Touch
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              Have questions about the platform? Need help with deal analysis? We&apos;re here to help you succeed in real estate investing.
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* General Inquiries */}
            <div className="bg-card rounded-xl border border-border/60 p-8 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">General Inquiries</h3>
              <p className="text-muted mb-4">
                For partnership opportunities, platform questions, or general information about Dealsletter.
              </p>
              <a 
                href="mailto:main@dealsletter.io" 
                className="text-accent hover:text-accent/80 transition-colors font-medium flex items-center space-x-2"
              >
                <span>main@dealsletter.io</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>

            {/* Support */}
            <div className="bg-card rounded-xl border border-border/60 p-8 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">Technical Support</h3>
              <p className="text-muted mb-4">
                Having issues with the platform? Need help with your account or deal analysis tools?
              </p>
              <a 
                href="mailto:support@dealsletter.io" 
                className="text-accent hover:text-accent/80 transition-colors font-medium flex items-center space-x-2"
              >
                <span>support@dealsletter.io</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>

          {/* Response Time */}
          <div className="bg-accent/10 rounded-xl border border-accent/20 p-8 text-center mb-12">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-primary">Quick Response Time</h3>
            </div>
            <p className="text-muted">
              We typically respond to all inquiries within 24-48 hours during business days. 
              For urgent platform issues, support tickets are prioritized.
            </p>
          </div>

          {/* Additional Info */}
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-primary mb-4">
              Before You Reach Out
            </h3>
            <p className="text-muted mb-6">
              You might find answers to your questions in our comprehensive FAQ section.
            </p>
            <Link 
              href="/faq" 
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <span>Visit FAQ</span>
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