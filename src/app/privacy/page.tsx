'use client'

import Link from 'next/link'
import Navigation from '@/components/Navigation'

export default function PrivacyPolicy() {
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

            <h1 className="text-4xl font-bold text-primary mb-4">Privacy Policy</h1>
            <p className="text-muted">Last Updated: December 26, 2025</p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none space-y-8">

            {/* Section 1 */}
            <section className="bg-card border border-border/40 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">1. Information We Collect</h2>

              <h3 className="text-lg font-semibold text-primary mt-4 mb-3">Information You Provide:</h3>
              <ul className="space-y-2 text-muted mb-4">
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Account information (name, email address)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Investment preferences and location</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Property addresses you analyze</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Payment information (processed securely by Stripe)</span>
                </li>
              </ul>

              <h3 className="text-lg font-semibold text-primary mt-4 mb-3">Automatically Collected Information:</h3>
              <ul className="space-y-2 text-muted">
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Usage data (analyses performed, features used)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Device information (browser type, IP address)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Cookies and similar tracking technologies</span>
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="bg-card border border-border/40 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">2. How We Use Your Information</h2>
              <p className="text-muted leading-relaxed mb-4">We use your information to:</p>
              <ul className="space-y-2 text-muted">
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Provide and improve the Service</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Process your property analyses</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Manage your account and subscription</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Send important updates about the Service</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Provide customer support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Analyze usage patterns to improve features</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Send marketing communications (with your consent)</span>
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="bg-card border border-border/40 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">3. Information Sharing</h2>
              <p className="text-muted leading-relaxed mb-4">We share your information with:</p>

              <h3 className="text-lg font-semibold text-primary mt-4 mb-3">Service Providers:</h3>
              <ul className="space-y-2 text-muted mb-4">
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span><strong className="text-primary">Supabase:</strong> Database and authentication</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span><strong className="text-primary">Stripe:</strong> Payment processing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span><strong className="text-primary">RentCast:</strong> Property data (addresses only)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span><strong className="text-primary">Anthropic:</strong> AI analysis generation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span><strong className="text-primary">Vercel:</strong> Hosting and deployment</span>
                </li>
              </ul>

              <div className="bg-green-500/10 border-l-4 border-green-500 p-4 rounded-r-lg">
                <p className="text-primary font-semibold">
                  We do NOT sell your personal information to third parties.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="bg-card border border-border/40 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">4. Data Security</h2>
              <p className="text-muted leading-relaxed">
                We implement industry-standard security measures including encryption, secure authentication,
                and regular security audits. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            {/* Section 5 */}
            <section className="bg-card border border-border/40 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">5. Your Rights</h2>
              <p className="text-muted leading-relaxed mb-4">You have the right to:</p>
              <ul className="space-y-2 text-muted mb-4">
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Access your personal data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Correct inaccurate data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Request deletion of your data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Export your analysis history</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Opt out of marketing communications</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Withdraw consent at any time</span>
                </li>
              </ul>
              <p className="text-muted leading-relaxed">
                To exercise these rights, contact us at{' '}
                <a href="mailto:privacy@dealsletter.io" className="text-accent hover:text-accent/80 transition-colors">
                  privacy@dealsletter.io
                </a>
              </p>
            </section>

            {/* Section 6 */}
            <section className="bg-card border border-border/40 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">6. Data Retention</h2>
              <p className="text-muted leading-relaxed">
                We retain your data for as long as your account is active or as needed to provide services.
                After account deletion, we may retain certain information for legal compliance, dispute resolution,
                and fraud prevention.
              </p>
            </section>

            {/* Section 7 */}
            <section className="bg-card border border-border/40 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">7. Cookies</h2>
              <p className="text-muted leading-relaxed">
                We use cookies and similar technologies for authentication, preferences, and analytics.
                You can control cookies through your browser settings, but some features may not function properly without them.
              </p>
            </section>

            {/* Section 8 */}
            <section className="bg-card border border-border/40 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">8. Children&apos;s Privacy</h2>
              <p className="text-muted leading-relaxed">
                The Service is not intended for users under 18. We do not knowingly collect information from children.
                If you believe a child has provided us with personal information, please contact us.
              </p>
            </section>

            {/* Section 9 */}
            <section className="bg-card border border-border/40 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">9. California Privacy Rights</h2>
              <p className="text-muted leading-relaxed">
                California residents have additional rights under CCPA, including the right to know what personal information
                is collected and the right to opt-out of sale (we do not sell personal information).
              </p>
            </section>

            {/* Section 10 */}
            <section className="bg-card border border-border/40 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">10. International Users</h2>
              <p className="text-muted leading-relaxed">
                Your information may be transferred to and processed in the United States. By using the Service,
                you consent to this transfer.
              </p>
            </section>

            {/* Section 11 */}
            <section className="bg-card border border-border/40 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">11. Changes to Privacy Policy</h2>
              <p className="text-muted leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of material changes via
                email or through the Service.
              </p>
            </section>

            {/* Section 12 */}
            <section className="bg-card border border-border/40 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">12. Contact Us</h2>
              <p className="text-muted leading-relaxed">
                For privacy questions or concerns, contact us at:<br />
                Email:{' '}
                <a href="mailto:privacy@dealsletter.io" className="text-accent hover:text-accent/80 transition-colors">
                  privacy@dealsletter.io
                </a>
              </p>
            </section>

          </div>

          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t border-border/40 flex flex-wrap gap-4 justify-center">
            <Link href="/terms" className="text-accent hover:text-accent/80 transition-colors">
              Terms of Service
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
