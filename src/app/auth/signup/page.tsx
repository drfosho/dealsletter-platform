'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'

// Top US Markets for the dropdown
const TOP_US_MARKETS = [
  { value: 'atlanta-ga', label: 'Atlanta, GA' },
  { value: 'austin-tx', label: 'Austin, TX' },
  { value: 'charlotte-nc', label: 'Charlotte, NC' },
  { value: 'chicago-il', label: 'Chicago, IL' },
  { value: 'dallas-tx', label: 'Dallas, TX' },
  { value: 'denver-co', label: 'Denver, CO' },
  { value: 'houston-tx', label: 'Houston, TX' },
  { value: 'indianapolis-in', label: 'Indianapolis, IN' },
  { value: 'jacksonville-fl', label: 'Jacksonville, FL' },
  { value: 'kansas-city-mo', label: 'Kansas City, MO' },
  { value: 'las-vegas-nv', label: 'Las Vegas, NV' },
  { value: 'los-angeles-ca', label: 'Los Angeles, CA' },
  { value: 'memphis-tn', label: 'Memphis, TN' },
  { value: 'miami-fl', label: 'Miami, FL' },
  { value: 'nashville-tn', label: 'Nashville, TN' },
  { value: 'orlando-fl', label: 'Orlando, FL' },
  { value: 'philadelphia-pa', label: 'Philadelphia, PA' },
  { value: 'phoenix-az', label: 'Phoenix, AZ' },
  { value: 'raleigh-nc', label: 'Raleigh, NC' },
  { value: 'san-antonio-tx', label: 'San Antonio, TX' },
  { value: 'san-diego-ca', label: 'San Diego, CA' },
  { value: 'san-francisco-ca', label: 'San Francisco Bay Area, CA' },
  { value: 'seattle-wa', label: 'Seattle, WA' },
  { value: 'tampa-fl', label: 'Tampa, FL' },
  { value: 'other', label: 'Other Market' }
]

// Multi-select dropdown component
function MarketMultiSelect({
  value,
  onChange,
  maxSelections = 5
}: {
  value: string[]
  onChange: (value: string[]) => void
  maxSelections?: number
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = (marketValue: string) => {
    if (value.includes(marketValue)) {
      onChange(value.filter(v => v !== marketValue))
    } else if (value.length < maxSelections) {
      onChange([...value, marketValue])
    }
  }

  const removeMarket = (marketValue: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(value.filter(v => v !== marketValue))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[52px] px-4 py-3 bg-background border border-border/60 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 flex flex-wrap gap-2 items-center"
      >
        {value.length === 0 ? (
          <span className="text-muted">Select up to 5 markets...</span>
        ) : (
          value.map(v => {
            const market = TOP_US_MARKETS.find(m => m.value === v)
            return (
              <span
                key={v}
                className="inline-flex items-center px-2 py-1 bg-accent/10 text-accent rounded-md text-sm"
              >
                {market?.label}
                <button
                  type="button"
                  onClick={(e) => removeMarket(v, e)}
                  className="ml-1 hover:text-accent/70"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )
          })
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border/60 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {TOP_US_MARKETS.map(market => (
            <div
              key={market.value}
              onClick={() => handleToggle(market.value)}
              className={`px-4 py-2 cursor-pointer flex items-center justify-between hover:bg-muted/10 ${
                value.includes(market.value) ? 'bg-accent/10 text-accent' : ''
              } ${value.length >= maxSelections && !value.includes(market.value) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span>{market.label}</span>
              {value.includes(market.value) && (
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}

      {value.length > 0 && (
        <p className="mt-1 text-xs text-muted">{value.length}/{maxSelections} markets selected</p>
      )}
    </div>
  )
}

export default function SignUpPage() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Step 2 - Preferences
  const [investmentStrategy, setInvestmentStrategy] = useState('')
  const [preferredMarkets, setPreferredMarkets] = useState<string[]>([])
  const [experience, setExperience] = useState('')
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true)

  const { signUp } = useAuth()
  const router = useRouter()

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate step 1
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setError('')
    setStep(2)
  }

  const handleFinalSubmit = async (skip: boolean = false) => {
    setLoading(true)
    setError('')
    setSuccess(false)

    // Parse first and last name from full name
    const nameParts = fullName.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    const metadata = {
      first_name: firstName,
      last_name: lastName,
      full_name: fullName.trim(),
      // Only include preferences if not skipped
      ...(skip ? {} : {
        primary_investment_strategy: investmentStrategy,
        preferred_markets: preferredMarkets,
        experience_level: experience,
        newsletter_subscribed: subscribeNewsletter,
      }),
      onboarding_completed: !skip,
    }

    console.log('Signing up with metadata:', metadata)

    const { error } = await signUp(email, password, metadata)

    if (error) {
      console.error('Signup error:', error)
      setError(error.message)
    } else {
      console.log('Signup successful')
      setSuccess(true)
      setTimeout(() => {
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)
      }, 2000)
    }

    setLoading(false)
  }

  const handleSkip = () => {
    handleFinalSubmit(true)
  }

  const handleCompleteSetup = (e: React.FormEvent) => {
    e.preventDefault()
    handleFinalSubmit(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-xl border border-border/60 p-8 shadow-lg text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-primary mb-2">Account Created!</h1>
            <p className="text-muted mb-6">
              We&apos;ve sent a verification email to <strong>{email}</strong>.
              Click the link in your email to verify your account and start analyzing properties.
            </p>
            <p className="text-sm text-muted">
              Redirecting to verification page...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <Image
                src="/logos/Copy of Dealsletter Official Logo Black.svg"
                alt="Dealsletter Logo"
                width={200}
                height={50}
                className="h-12 w-auto mx-auto"
              />
            </Link>
          </div>

          {/* Sign Up Form */}
          <div className="bg-card rounded-xl border border-border/60 p-8 shadow-lg">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= 1 ? 'bg-accent text-white' : 'bg-muted/20 text-muted'
                  }`}>
                    {step > 1 ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : '1'}
                  </div>
                  <div className={`w-24 h-1 rounded-full ${
                    step >= 2 ? 'bg-accent' : 'bg-muted/20'
                  }`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= 2 ? 'bg-accent text-white' : 'bg-muted/20 text-muted'
                  }`}>
                    2
                  </div>
                </div>
                <span className="text-sm text-muted">Step {step} of 2</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Step 1: Account Creation */}
            {step === 1 && (
              <div>
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-primary mb-2">Start Analyzing Properties in Seconds</h1>
                  <p className="text-muted">Join thousands of investors using AI-powered analysis</p>
                </div>

                <form onSubmit={handleStep1Submit} className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-primary mb-2">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-background border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 min-h-[44px]"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-background border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 min-h-[44px]"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-primary mb-2">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full px-4 py-3 bg-background border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 min-h-[44px]"
                      placeholder="Create a secure password"
                    />
                    <p className="mt-1 text-xs text-muted">Minimum 8 characters</p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary mb-2">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-background border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 min-h-[44px]"
                      placeholder="Confirm your password"
                    />
                  </div>

                  <div className="flex items-start">
                    <input
                      id="terms"
                      type="checkbox"
                      required
                      className="h-4 w-4 mt-0.5 text-accent focus:ring-accent/20 border-border/60 rounded"
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-muted">
                      I agree to the{' '}
                      <Link
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:text-accent/80 transition-colors"
                      >
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link
                        href="/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:text-accent/80 transition-colors"
                      >
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium min-h-[44px] flex items-center justify-center"
                  >
                    Create Free Account
                  </button>
                </form>

                {/* Benefits */}
                <div className="mt-6 pt-6 border-t border-border/40">
                  <p className="text-sm font-medium text-primary mb-3">What you get with Dealsletter:</p>
                  <ul className="space-y-2 text-sm text-muted">
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      3 free property analyses per month
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      AI-powered investment recommendations
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Detailed ROI and cash flow projections
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Access to market insights
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 2: Preferences */}
            {step === 2 && (
              <div>
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-primary mb-2">Personalize Your Experience</h1>
                  <p className="text-muted">Help us tailor Dealsletter to your investment goals</p>
                </div>

                <form onSubmit={handleCompleteSetup} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Primary Investment Strategy
                    </label>
                    <select
                      value={investmentStrategy}
                      onChange={(e) => setInvestmentStrategy(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 min-h-[44px]"
                    >
                      <option value="">Select a strategy...</option>
                      <option value="fix-and-flip">Fix & Flip</option>
                      <option value="buy-and-hold">Buy & Hold / Rental</option>
                      <option value="brrrr">BRRRR</option>
                      <option value="house-hack">House Hacking</option>
                      <option value="exploring">Still Exploring</option>
                    </select>
                    <p className="mt-1 text-xs text-muted">We&apos;ll optimize analysis defaults for your strategy</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Preferred Markets <span className="text-muted font-normal">(Optional)</span>
                    </label>
                    <MarketMultiSelect
                      value={preferredMarkets}
                      onChange={setPreferredMarkets}
                      maxSelections={5}
                    />
                    <p className="mt-1 text-xs text-muted">We&apos;ll highlight deals in these markets</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Real Estate Experience
                    </label>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 min-h-[44px]"
                    >
                      <option value="">Select your experience level...</option>
                      <option value="beginner">Beginner (0-1 deals)</option>
                      <option value="intermediate">Intermediate (2-5 deals)</option>
                      <option value="experienced">Experienced (6+ deals)</option>
                      <option value="professional">Professional Investor</option>
                    </select>
                    <p className="mt-1 text-xs text-muted">Helps us tailor educational content</p>
                  </div>

                  <div className="flex items-start pt-2">
                    <input
                      id="newsletter"
                      type="checkbox"
                      checked={subscribeNewsletter}
                      onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                      className="h-4 w-4 mt-0.5 text-accent focus:ring-accent/20 border-border/60 rounded"
                    />
                    <label htmlFor="newsletter" className="ml-2 block text-sm text-muted">
                      Subscribe to Dealsletter newsletter (weekly market insights & deals)
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleSkip}
                      disabled={loading}
                      className="flex-1 px-6 py-3 border border-border text-primary rounded-lg hover:bg-muted/5 transition-colors font-medium min-h-[44px] flex items-center justify-center disabled:opacity-50"
                    >
                      Skip for Now
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium min-h-[44px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Creating...</span>
                        </div>
                      ) : (
                        'Complete Setup'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-muted">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-accent hover:text-accent/80 transition-colors font-medium">
                  Log in
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-muted flex justify-center gap-4">
            <p>© {new Date().getFullYear()} Dealsletter</p>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          </div>
        </div>
      </div>

      {/* Right side - Hero Image/Benefits (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-accent/5 to-primary/5 items-center justify-center p-12">
        <div className="max-w-lg">
          <div className="mb-8">
            <div className="inline-flex items-center px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium mb-4">
              AI-Powered Property Analysis
            </div>
            <h2 className="text-3xl font-bold text-primary mb-4">
              Make Smarter Investment Decisions in Seconds
            </h2>
            <p className="text-lg text-muted">
              Enter any property address and get instant AI-powered analysis with ROI projections,
              cash flow estimates, and personalized investment recommendations.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-card rounded-lg border border-border/40">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-primary">Detailed Financial Projections</h3>
                <p className="text-sm text-muted">Cash flow, cap rate, ROI, and more calculated instantly</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-card rounded-lg border border-border/40">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-primary">Multiple Investment Strategies</h3>
                <p className="text-sm text-muted">Fix & Flip, BRRRR, Buy & Hold, House Hacking</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-card rounded-lg border border-border/40">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-primary">AI-Powered Recommendations</h3>
                <p className="text-sm text-muted">Get personalized insights and risk assessments</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-card rounded-lg border border-border/40">
            <div className="flex items-center space-x-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-accent/20 rounded-full border-2 border-card"></div>
                <div className="w-8 h-8 bg-primary/20 rounded-full border-2 border-card"></div>
                <div className="w-8 h-8 bg-accent/30 rounded-full border-2 border-card"></div>
              </div>
              <p className="text-sm text-muted">
                <strong className="text-primary">1,000+</strong> investors trust Dealsletter
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
