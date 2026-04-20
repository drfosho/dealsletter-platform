import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Instrument_Serif } from 'next/font/google'
import V3Shell from '@/components/v3/V3Shell'

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
  title: 'Dealsletter V3 — Terminal',
  description: 'V3 operator terminal for Dealsletter.',
}

export default function V3Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`v3-root ${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable}`}
    >
      <V3Shell>{children}</V3Shell>
    </div>
  )
}
