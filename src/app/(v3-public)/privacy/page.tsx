import LegalPage, { type LegalSection } from '@/components/v3/public/LegalPage'

const SECTIONS: LegalSection[] = [
  {
    heading: '1. Information We Collect',
    body: 'We collect: email address and password (account creation), property addresses you analyze, usage data (pages visited, features used), and payment information (processed by Stripe — we never store card details directly).',
  },
  {
    heading: '2. How We Use Your Information',
    body: 'We use your information to: provide and improve the service, send transactional emails (account confirmation, billing receipts), send product updates (you can unsubscribe anytime), and analyze usage patterns to improve the product.',
  },
  {
    heading: '3. Data Storage',
    body: 'Your data is stored in Supabase (PostgreSQL) hosted on AWS. All data is encrypted at rest and in transit. We do not sell your data to third parties.',
  },
  {
    heading: '4. Third-Party Services',
    body: 'We use: Supabase (database and auth), Stripe (payments), Resend (email), RentCast (property data), OpenAI, Anthropic, and xAI (AI analysis). Each has its own privacy policy governing their handling of data.',
  },
  {
    heading: '5. Data Retention',
    body: 'We retain your account data for as long as your account is active. Analyses are retained indefinitely unless you delete them. If you cancel your account, data is retained for 90 days then permanently deleted.',
  },
  {
    heading: '6. Your Rights',
    body: 'You have the right to: access your data, correct inaccurate data, delete your account and data, export your analysis history, and opt out of marketing emails. To exercise these rights, email privacy@dealsletter.io.',
  },
  {
    heading: '7. Cookies',
    body: 'We use essential cookies for authentication session management. We do not use tracking cookies or advertising pixels.',
  },
  {
    heading: '8. Children\u2019s Privacy',
    body: 'Dealsletter is not intended for users under 18. We do not knowingly collect data from minors.',
  },
  {
    heading: '9. Contact',
    body: 'Privacy questions or data requests: privacy@dealsletter.io',
  },
]

export const metadata = {
  title: 'Privacy Policy | Dealsletter',
  description: 'Dealsletter privacy policy.',
}

export default function V3PrivacyPage() {
  return <LegalPage title="Privacy Policy" lastUpdated="January 1, 2026" sections={SECTIONS} />
}
