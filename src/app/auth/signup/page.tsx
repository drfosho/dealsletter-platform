'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'

export default function SignUpPage() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  // Investor profile data
  const [investorExperience, setInvestorExperience] = useState('')
  const [dealTypes, setDealTypes] = useState<string[]>([])
  const [investmentGoals, setInvestmentGoals] = useState('')
  const [budget, setBudget] = useState('')
  const [location, setLocation] = useState('')
  
  const { signUp } = useAuth()
  const router = useRouter()

  const handleNextStep = () => {
    if (step === 1) {
      // Validate step 1
      if (!firstName || !lastName || !email || !password || !confirmPassword) {
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
    } else if (step === 2) {
      // Validate step 2
      if (!investorExperience || dealTypes.length === 0) {
        setError('Please complete your investor profile')
        return
      }
      setError('')
      setStep(3)
    }
  }

  const handlePrevStep = () => {
    setError('')
    setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    // Validate final step
    if (!investmentGoals || !budget || !location) {
      setError('Please complete all fields')
      setLoading(false)
      return
    }

    const metadata = {
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`,
      investor_experience: investorExperience,
      deal_types: dealTypes,
      investment_goals: investmentGoals,
      budget: budget,
      location: location,
    }

    console.log('Signing up with metadata:', metadata)
    
    const { error } = await signUp(email, password, metadata)
    
    if (error) {
      console.error('Signup error:', error)
      setError(error.message)
    } else {
      console.log('Signup successful')
      setSuccess(true)
      // Redirect to email verification page
      setTimeout(() => {
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)
      }, 2000)
    }
    
    setLoading(false)
  }

  const handleDealTypeToggle = (dealType: string) => {
    setDealTypes(prev => 
      prev.includes(dealType) 
        ? prev.filter(type => type !== dealType)
        : [...prev, dealType]
    )
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
              Click the link in your email to verify your account and access your dashboard.
            </p>
            <p className="text-sm text-muted">
              Redirecting to verification page in 2 seconds...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
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

        {/* Multi-Step Sign Up Form */}
        <div className="bg-card rounded-xl border border-border/60 p-8 shadow-lg">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 1 ? 'bg-accent text-white' : 'bg-muted/20 text-muted'
                }`}>
                  1
                </div>
                <div className={`w-16 h-1 rounded-full ${
                  step >= 2 ? 'bg-accent' : 'bg-muted/20'
                }`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 2 ? 'bg-accent text-white' : 'bg-muted/20 text-muted'
                }`}>
                  2
                </div>
                <div className={`w-16 h-1 rounded-full ${
                  step >= 3 ? 'bg-accent' : 'bg-muted/20'
                }`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 3 ? 'bg-accent text-white' : 'bg-muted/20 text-muted'
                }`}>
                  3
                </div>
              </div>
              <span className="text-sm text-muted">Step {step} of 3</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Step 1: Account Details */}
          {step === 1 && (
            <div>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-primary mb-2">Create Account</h1>
                <p className="text-muted">Let&apos;s get started with your basic information</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-primary mb-2">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-background border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 min-h-[44px]"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-primary mb-2">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-background border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 min-h-[44px]"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-background border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 min-h-[44px]"
                    placeholder="john@example.com"
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
                    className="w-full px-4 py-3 bg-background border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 min-h-[44px]"
                    placeholder="Min. 8 characters"
                  />
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

                <div className="flex items-center">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-accent focus:ring-accent/20 border-border/60 rounded"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-muted">
                    I agree to the{' '}
                    <Link href="/terms" className="text-accent hover:text-accent/80 transition-colors">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-accent hover:text-accent/80 transition-colors">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium min-h-[44px] flex items-center justify-center"
                >
                  Continue to Investor Profile
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Investor Experience */}
          {step === 2 && (
            <div>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-primary mb-2">Investor Profile</h1>
                <p className="text-muted">Help us understand your investment experience</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-primary mb-4">
                    How many rental properties do you currently own?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { value: 'none', label: 'None - I\'m New', icon: '🚀' },
                      { value: '1-9', label: '1-9 Properties', icon: '🏠' },
                      { value: '10-49', label: '10-49 Properties', icon: '🏘️' },
                      { value: '50+', label: '50+ Properties', icon: '🏢' },
                      { value: 'bigtime', label: 'I\'m Big Time', icon: '💎' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setInvestorExperience(option.value)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 text-left min-h-[60px] flex items-center space-x-3 ${
                          investorExperience === option.value
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border/60 hover:border-accent/30 hover:bg-muted/5'
                        }`}
                      >
                        <span className="text-xl">{option.icon}</span>
                        <span className="font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-4">
                    What types of deals are you interested in? (Select all that apply)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { value: 'brrrr', label: 'BRRRR Deals', icon: '🔄' },
                      { value: 'fix-flip', label: 'Fix & Flip', icon: '🔨' },
                      { value: 'buy-hold', label: 'Buy & Hold', icon: '📈' },
                      { value: 'multifamily', label: 'Multifamily', icon: '🏢' },
                      { value: 'commercial', label: 'Commercial', icon: '🏗️' },
                      { value: 'land', label: 'Land Development', icon: '🏞️' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleDealTypeToggle(option.value)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 text-left min-h-[52px] flex items-center space-x-3 ${
                          dealTypes.includes(option.value)
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border/60 hover:border-accent/30 hover:bg-muted/5'
                        }`}
                      >
                        <span className="text-lg">{option.icon}</span>
                        <span className="font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 px-6 py-3 border border-border text-primary rounded-lg hover:bg-muted/5 transition-colors font-medium min-h-[44px] flex items-center justify-center"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium min-h-[44px] flex items-center justify-center"
                  >
                    Continue to Preferences
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Investment Preferences */}
          {step === 3 && (
            <div>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-primary mb-2">Investment Preferences</h1>
                <p className="text-muted">Final step to personalize your deal flow</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-primary mb-4">
                    What&apos;s your primary investment goal?
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: 'cash-flow', label: 'Monthly Cash Flow', icon: '💰' },
                      { value: 'appreciation', label: 'Long-term Appreciation', icon: '📈' },
                      { value: 'quick-profits', label: 'Quick Profits (Flips)', icon: '⚡' },
                      { value: 'passive-income', label: 'Passive Income Stream', icon: '🏖️' },
                      { value: 'portfolio-growth', label: 'Portfolio Growth', icon: '🚀' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setInvestmentGoals(option.value)}
                        className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left min-h-[60px] flex items-center space-x-3 ${
                          investmentGoals === option.value
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border/60 hover:border-accent/30 hover:bg-muted/5'
                        }`}
                      >
                        <span className="text-xl">{option.icon}</span>
                        <span className="font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-4">
                    What&apos;s your typical investment budget per deal?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { value: 'under-50k', label: 'Under $50K', icon: '💵' },
                      { value: '50k-100k', label: '$50K - $100K', icon: '💴' },
                      { value: '100k-500k', label: '$100K - $500K', icon: '💶' },
                      { value: '500k-1m', label: '$500K - $1M', icon: '💷' },
                      { value: 'over-1m', label: 'Over $1M', icon: '💎' },
                      { value: 'flexible', label: 'Flexible/Varies', icon: '🎯' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setBudget(option.value)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 text-left min-h-[52px] flex items-center space-x-3 ${
                          budget === option.value
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border/60 hover:border-accent/30 hover:bg-muted/5'
                        }`}
                      >
                        <span className="text-lg">{option.icon}</span>
                        <span className="font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-primary mb-2">
                    Preferred investment location/market
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-background border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 min-h-[44px]"
                    placeholder="e.g., Los Angeles, CA or Southeast US"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 px-6 py-3 border border-border text-primary rounded-lg hover:bg-muted/5 transition-colors font-medium min-h-[44px] flex items-center justify-center"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium min-h-[44px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin"></div>
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      'Create Account'
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
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted">
          <p>© 2024 Dealsletter Platform. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}