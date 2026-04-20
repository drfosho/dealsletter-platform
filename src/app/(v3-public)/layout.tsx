import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Instrument_Serif } from 'next/font/google'
import PublicNav from '@/components/v3/public/PublicNav'
import PublicFooter from '@/components/v3/public/PublicFooter'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-v3-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-v3-mono',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: 'italic',
  variable: '--font-v3-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Dealsletter — AI-Native Real Estate Underwriting',
  description:
    'The terminal for real estate investors. Enter any address and get cap rate, cash flow, 5-year ROI, and a narrative written by three frontier models.',
}

export default function V3PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`v3-root ${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable}`}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      <PublicNav />
      <main style={{ flex: 1 }}>{children}</main>
      <PublicFooter />
    </div>
  )
}
