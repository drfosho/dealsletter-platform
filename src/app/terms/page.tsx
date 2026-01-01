'use client'

import Link from 'next/link'
import Navigation from '@/components/Navigation'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <Link href="/" className="text-accent hover:text-accent/80 transition-colors text-sm flex items-center space-x-2 mb-8">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Home</span>
            </Link>

            <h1 className="text-4xl font-bold text-primary mb-4">Terms of Service</h1>
            <p className="text-muted">Last Updated: December 26, 2025</p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none space-y-8">

            {/* Section 1 */}
            <section className="bg-card border border-border/40 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">1. Agreement to Terms</h2>
              <p className="text-muted leading-relaxed">
                By accessing or using Dealsletter (&quot;Service&quot;), you agree to be bound by these Terms of Service.
                If you disagree with any part of these terms, you may not access the Service.
              </p>
            </section>

            {/* Section 2 */}
            <section className="bg-card border border-border/40 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">2. Description of Service</h2>
              <p className="text-muted leading-relaxed mb-4">
                Dealsletter is an AI-powered property analysis tool that provides investment insights,
                financial projections, and recommendations for real estate properties. The Service includes:
              </p>
              <ul className="space-y-2 text-muted">
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Property analysis and financial calculations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>AI-generated investment recommendations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Market data and comparable sales information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Educational content and blog articles</span>
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="bg-card border border-border/40 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">3. User Accounts</h2>
              <p className="text-muted leading-relaxed mb-4">
                To access certain features, you must create an account. You agree to:
              </p>
              <ul className="space-y-2 text-muted">
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Provide accurate, current, and complete information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Maintain the security of your account credentials</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Accept responsibility for all activities under your account</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Notify us immediately of any unauthorized access</span>
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="bg-card border border-border/40 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">4. Subscription Plans</h2>
              <div className="space-y-3 text-muted mb-4">
                <p><strong className="text-primary">Free Plan:</strong> 3 property analyses per month</p>
                <p><strong className="text-primary">Pro Plan:</strong> $29/month for 50 analyses per month</p>
                <p><strong className="text-primary">Pro Plus Plan:</strong> $59/month for 200 analyses per month</p>
              </div>
              <p className="text-muted leading-relaxed">
                Subscriptions automatically renew unless cancelled. You may cancel at any time from your account settings.
                Refunds are not provided for partial billing periods.
              </p>
            </section>

            {/* Section 5 */}
            <section className="bg-card border border-border/40 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">5. Acceptable Use</h2>
              <p className="text-muted leading-relaxed mb-4">You agree NOT to:</p>
              <ul className="space-y-2 text-muted">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>Use the Service for any illegal purpose</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>Attempt to circumvent usage limits or access restrictions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>Scrape, copy, or redistribute data without permission</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>Interfere with the Service&apos;s operation or security</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>Share your account credentials with others</span>
                </li>
              </ul>
            </section>

            {/* Section 6 - Investment Disclaimer */}
            <section className="bg-red-500/5 border-2 border-red-500/20 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">6. Investment Disclaimer</h2>
              <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-lg mb-4">
                <p className="text-primary font-semibold">
                  IMPORTANT: Dealsletter provides educational information and analysis tools only.
                  This is NOT investment advice. All property analyses, projections, and recommendations are estimates
                  based on available data and should not be relied upon as the sole basis for investment decisions.
                </p>
              </div>
              <p className="text-muted leading-relaxed mb-4">You acknowledge that:</p>
              <ul className="space-y-2 text-muted">
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Real estate investing involves substantial risk</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Past performance does not guarantee future results</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>All financial projections are estimates and may be inaccurate</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>You should conduct your own due diligence and consult with qualified professionals</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Dealsletter is not a licensed real estate broker or financial advisor</span>
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="bg-card border border-border/40 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">7. Data Accuracy</h2>
              <p className="text-muted leading-relaxed">
                We obtain property data from third-party sources including RentCast API. While we strive for accuracy,
                we do not guarantee the completeness, accuracy, or timeliness of any data. You agree to verify all
                information independently before making investment decisions.
              </p>
            </section>

            {/* Section 8 */}
            <section className="bg-card border border-border/40 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">8. Intellectual Property</h2>
              <p className="text-muted leading-relaxed">
                The Service, including all content, features, and functionality, is owned by Dealsletter and protected
                by copyright, trademark, and other intellectual property laws. Your analyses and saved data remain your property.
              </p>
            </section>

            {/* Section 9 */}
            <section className="bg-card border border-border/40 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">9. Limitation of Liability</h2>
              <p className="text-muted leading-relaxed uppercase text-sm">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, DEALSLETTER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR INVESTMENT LOSSES,
                ARISING FROM YOUR USE OF THE SERVICE.
              </p>
            </section>

            {/* Section 10 */}
            <section className="bg-card border border-border/40 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">10. Termination</h2>
              <p className="text-muted leading-relaxed">
                We may terminate or suspend your account immediately, without prior notice, for any violation of these Terms.
                Upon termination, your right to use the Service will cease immediately.
              </p>
            </section>

            {/* Section 11 */}
            <section className="bg-card border border-border/40 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">11. Changes to Terms</h2>
              <p className="text-muted leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of material changes via
                email or through the Service. Continued use after changes constitutes acceptance of new terms.
              </p>
            </section>

            {/* Section 12 */}
            <section className="bg-card border border-border/40 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">12. Contact</h2>
              <p className="text-muted leading-relaxed">
                For questions about these Terms, contact us at:{' '}
                <a href="mailto:support@dealsletter.io" className="text-accent hover:text-accent/80 transition-colors">
                  support@dealsletter.io
                </a>
              </p>
            </section>

          </div>

          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t border-border/40 flex flex-wrap gap-4 justify-center">
            <Link href="/privacy" className="text-accent hover:text-accent/80 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-muted">•</span>
            <Link href="/contact" className="text-accent hover:text-accent/80 transition-colors">
              Contact Us
            </Link>
            <span className="text-muted">•</span>
            <Link href="/faq" className="text-accent hover:text-accent/80 transition-colors">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
