'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { createClient } from '@/lib/supabase/client'
import { useSubscription } from '@/hooks/useSubscription'
import { 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  Check,
  ChevronRight,
  Download,
  Loader2
} from 'lucide-react'

interface BillingHistory {
  id: string
  amount: number
  currency: string
  status: string
  description: string
  invoice_url: string | null
  invoice_pdf: string | null
  paid_at: string | null
  created_at: string
}

export default function SubscriptionPage() {
  const router = useRouter()
  const { subscription, loading: subLoading } = useSubscription()
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([])
  const [loadingPortal, setLoadingPortal] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setProfile(profileData)

      // Fetch billing history
      const { data: billingData } = await supabase
        .from('billing_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (billingData) {
        setBillingHistory(billingData)
      }
    }

    fetchData()
  }, [supabase, router])

  const handleManageBilling = async () => {
    setLoadingPortal(true)
    try {
      const response = await fetch('/api/stripe/billing-portal', {
        method: 'POST',
      })
      
      const { url, error } = await response.json()
      
      if (error) {
        console.error('Error accessing billing portal:', error)
        alert('Unable to access billing portal. Please try again.')
        return
      }
      
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoadingPortal(false)
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'free': return 'bg-gray-500/10 text-gray-600'
      case 'starter': return 'bg-blue-500/10 text-blue-600'
      case 'pro': return 'bg-purple-500/10 text-purple-600'
      case 'premium': return 'bg-amber-500/10 text-amber-600'
      default: return 'bg-gray-500/10 text-gray-600'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'trialing':
        return 'bg-green-500/10 text-green-600'
      case 'canceled':
        return 'bg-red-500/10 text-red-600'
      case 'past_due':
        return 'bg-orange-500/10 text-orange-600'
      default:
        return 'bg-gray-500/10 text-gray-600'
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100)
  }

  if (subLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full px-6 py-3 bg-background/80 backdrop-blur-xl z-50 border-b border-border/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Logo width={300} height={75} className="h-12 md:h-16 w-auto" priority />
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard" className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium">
              Dashboard
            </Link>
            <Link href="/account" className="px-6 py-3 text-primary transition-colors font-medium">
              Account
            </Link>
            <Link href="/pricing" className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium">
              Pricing
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-32 px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Subscription & Billing</h1>
            <p className="text-muted">Manage your subscription, billing details, and invoices</p>
          </div>

          {/* Current Plan Card */}
          <div className="bg-card rounded-xl border border-border/60 p-6 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-primary mb-2">Current Plan</h2>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTierColor(subscription?.tier || 'free')}`}>
                    {subscription?.tier?.toUpperCase() || 'FREE'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(subscription?.status || 'inactive')}`}>
                    {subscription?.status?.toUpperCase() || 'INACTIVE'}
                  </span>
                </div>
              </div>
              
              {subscription?.tier !== 'free' ? (
                <button
                  onClick={handleManageBilling}
                  disabled={loadingPortal}
                  className="px-4 py-2 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center space-x-2"
                >
                  {loadingPortal ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  <span>Manage Billing</span>
                </button>
              ) : (
                <Link
                  href="/pricing"
                  className="px-4 py-2 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Upgrade Plan
                </Link>
              )}
            </div>

            {/* Plan Details */}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center space-x-2 text-muted mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Monthly Analyses</span>
                </div>
                <p className="text-xl font-semibold text-primary">
                  {subscription?.analysisLimit === -1 ? 'Unlimited' : 
                   subscription?.analysisLimit === 0 ? 'View Only' :
                   `${subscription?.analysisUsed || 0} / ${subscription?.analysisLimit}`}
                </p>
              </div>

              <div>
                <div className="flex items-center space-x-2 text-muted mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Next Billing Date</span>
                </div>
                <p className="text-xl font-semibold text-primary">
                  {profile?.subscription_current_period_end 
                    ? formatDate(profile.subscription_current_period_end)
                    : 'N/A'}
                </p>
              </div>

              <div>
                <div className="flex items-center space-x-2 text-muted mb-1">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-sm">Monthly Cost</span>
                </div>
                <p className="text-xl font-semibold text-primary">
                  {subscription?.tier === 'free' ? '$0' :
                   subscription?.tier === 'starter' ? '$29' :
                   subscription?.tier === 'pro' ? '$69' :
                   subscription?.tier === 'premium' ? '$159' : '$0'}
                </p>
              </div>
            </div>

            {/* Trial Notice */}
            {profile?.subscription_trial_end && new Date(profile.subscription_trial_end) > new Date() && (
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <p className="text-sm text-blue-600">
                    Free trial ends on {formatDate(profile.subscription_trial_end)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Features Included */}
          <div className="bg-card rounded-xl border border-border/60 p-6 mb-8">
            <h2 className="text-xl font-semibold text-primary mb-4">Features Included</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {subscription?.tier === 'free' ? (
                <>
                  <div className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted">View all curated deals</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted">Basic deal comparison</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted">30-day archive access</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted">Market trend insights</span>
                  </div>
                </>
              ) : subscription?.tier === 'starter' ? (
                <>
                  <div className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted">Everything in Free</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted">12 property analyses/month</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted">Deal alerts and filters</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted">PDF exports</span>
                  </div>
                </>
              ) : subscription?.tier === 'pro' ? (
                <>
                  <div className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted">Everything in Starter</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted">35 property analyses/month</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted">Advanced analytics dashboard</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted">Early deal access (24hrs)</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted">Priority support</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted">Market reports</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted">Everything in Pro</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted">Unlimited analyses*</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted">Weekly strategy sessions</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted">Custom deal sourcing</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted">Phone support</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted">API access</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Billing History */}
          <div className="bg-card rounded-xl border border-border/60 p-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Billing History</h2>
            
            {billingHistory.length > 0 ? (
              <div className="space-y-3">
                {billingHistory.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 bg-muted/5 rounded-lg hover:bg-muted/10 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-2 h-2 rounded-full ${
                        invoice.status === 'paid' ? 'bg-green-500' :
                        invoice.status === 'pending' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-medium text-primary">
                          {formatCurrency(invoice.amount)}
                        </p>
                        <p className="text-sm text-muted">
                          {invoice.description || 'Subscription payment'}
                        </p>
                        <p className="text-xs text-muted mt-1">
                          {formatDate(invoice.paid_at || invoice.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    {invoice.invoice_pdf && (
                      <a
                        href={invoice.invoice_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-accent hover:text-accent/80 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-sm">Invoice</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-muted/30 mx-auto mb-3" />
                <p className="text-muted">No billing history yet</p>
                <p className="text-sm text-muted mt-1">
                  Your invoices will appear here once you upgrade
                </p>
              </div>
            )}
          </div>

          {/* Upgrade CTA */}
          {subscription?.tier === 'free' && (
            <div className="mt-8 bg-primary/5 rounded-xl border border-primary/20 p-8 text-center">
              <h3 className="text-2xl font-bold text-primary mb-3">
                Ready to unlock more features?
              </h3>
              <p className="text-muted mb-6">
                Upgrade your plan to start analyzing properties and get access to advanced features
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                View Available Plans
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}