import LegalPage, { type LegalSection } from '@/components/v3/public/LegalPage'

const SECTIONS: LegalSection[] = [
  {
    heading: '1. Acceptance of Terms',
    body: 'By accessing or using Dealsletter, you agree to be bound by these Terms of Service. If you do not agree, do not use the service.',
  },
  {
    heading: '2. Description of Service',
    body: 'Dealsletter provides AI-powered real estate investment analysis tools. All analyses are for informational purposes only and do not constitute financial, legal, or investment advice. Always conduct your own due diligence before making any investment decision.',
  },
  {
    heading: '3. User Accounts',
    body: 'You are responsible for maintaining the security of your account credentials. You must be at least 18 years old to create an account. One account per person — sharing accounts is not permitted.',
  },
  {
    heading: '4. Acceptable Use',
    body: 'You agree not to: reverse engineer the service, resell or redistribute analyses, use the service for any unlawful purpose, or attempt to access systems or data beyond your authorization.',
  },
  {
    heading: '5. Subscription and Billing',
    body: 'Paid plans are billed monthly or annually via Stripe. You may cancel at any time from your account settings. Cancellation takes effect at the end of the current billing period. We do not offer refunds except as required by law.',
  },
  {
    heading: '6. Intellectual Property',
    body: 'All content, models, prompts, and infrastructure are the intellectual property of Dealsletter (Godbey Property Ventures LLC). You retain ownership of property addresses and inputs you provide.',
  },
  {
    heading: '7. Disclaimer of Warranties',
    body: 'The service is provided "as is" without warranties of any kind. We do not guarantee the accuracy of any analysis, valuation, or market data.',
  },
  {
    heading: '8. Limitation of Liability',
    body: 'Dealsletter shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service. Our maximum liability is limited to the amount you paid us in the 12 months preceding the claim.',
  },
  {
    heading: '9. Changes to Terms',
    body: 'We may update these terms at any time. Continued use of the service after changes constitutes acceptance. We will notify users of material changes via email.',
  },
  {
    heading: '10. Contact',
    body: 'Questions about these terms: legal@dealsletter.io',
  },
]

export const metadata = {
  title: 'Terms of Service | Dealsletter',
  description: 'Dealsletter terms of service.',
}

export default function V3TermsPage() {
  return <LegalPage title="Terms of Service" lastUpdated="January 1, 2026" sections={SECTIONS} />
}
