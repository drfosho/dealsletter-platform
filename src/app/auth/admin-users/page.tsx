'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

interface UserProfile {
  id: string
  first_name: string
  last_name: string
  full_name: string
  investor_experience: string
  deal_types: string[]
  investment_goals: string
  budget: string
  location: string
  created_at: string
}

export default function AdminUsers() {
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [experienceFilter, setExperienceFilter] = useState('')
  const [budgetFilter, setBudgetFilter] = useState('')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table')

  useEffect(() => {
    fetchProfiles()
  }, [])

  const filterProfiles = useCallback(() => {
    let filtered = profiles

    if (searchTerm) {
      filtered = filtered.filter(profile =>
        profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.location?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (experienceFilter) {
      filtered = filtered.filter(profile => profile.investor_experience === experienceFilter)
    }

    if (budgetFilter) {
      filtered = filtered.filter(profile => profile.budget === budgetFilter)
    }

    setFilteredProfiles(filtered)
  }, [profiles, searchTerm, experienceFilter, budgetFilter])

  useEffect(() => {
    filterProfiles()
  }, [filterProfiles])

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setProfiles(data || [])
        setFilteredProfiles(data || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const getExperienceLabel = (experience: string) => {
    const labels: { [key: string]: string } = {
      'none': '🚀 None - New',
      '1-9': '🏠 1-9 Properties',
      '10-49': '🏘️ 10-49 Properties',
      '50+': '🏢 50+ Properties',
      'bigtime': '💎 Big Time'
    }
    return labels[experience] || experience
  }

  const getGoalLabel = (goal: string) => {
    const labels: { [key: string]: string } = {
      'cash-flow': '💰 Cash Flow',
      'appreciation': '📈 Appreciation',
      'quick-profits': '⚡ Quick Profits',
      'passive-income': '🏖️ Passive Income',
      'portfolio-growth': '🚀 Portfolio Growth'
    }
    return labels[goal] || goal
  }

  const getBudgetLabel = (budget: string) => {
    const labels: { [key: string]: string } = {
      'under-50k': '💵 Under $50K',
      '50k-100k': '💴 $50K - $100K',
      '100k-500k': '💶 $100K - $500K',
      '500k-1m': '💷 $500K - $1M',
      'over-1m': '💎 Over $1M',
      'flexible': '🎯 Flexible'
    }
    return labels[budget] || budget
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted">Loading user profiles...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">User Profiles</h1>
            <p className="text-muted mt-1">{filteredProfiles.length} users found</p>
          </div>
          <div className="flex gap-3">
            <div className="flex bg-card rounded-lg border border-border/60 p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded text-sm ${
                  viewMode === 'table' 
                    ? 'bg-primary text-secondary' 
                    : 'text-muted hover:text-primary'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded text-sm ${
                  viewMode === 'cards' 
                    ? 'bg-primary text-secondary' 
                    : 'text-muted hover:text-primary'
                }`}
              >
                Cards
              </button>
            </div>
            <Link href="/auth/signup" className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90">
              Test Signup
            </Link>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-card rounded-lg border border-border/60 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-2">Experience Level</label>
              <select
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                <option value="">All Experience Levels</option>
                <option value="none">None - New</option>
                <option value="1-9">1-9 Properties</option>
                <option value="10-49">10-49 Properties</option>
                <option value="50+">50+ Properties</option>
                <option value="bigtime">Big Time</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-2">Budget Range</label>
              <select
                value={budgetFilter}
                onChange={(e) => setBudgetFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                <option value="">All Budgets</option>
                <option value="under-50k">Under $50K</option>
                <option value="50k-100k">$50K - $100K</option>
                <option value="100k-500k">$100K - $500K</option>
                <option value="500k-1m">$500K - $1M</option>
                <option value="over-1m">Over $1M</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setExperienceFilter('')
                  setBudgetFilter('')
                }}
                className="px-4 py-2 bg-muted/20 text-muted rounded-lg hover:bg-muted/30 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-600">{error}</p>
            <p className="text-sm text-red-500 mt-2">
              Make sure you&apos;ve run the SQL setup script to create the user_profiles table.
            </p>
          </div>
        )}

        {profiles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-xl font-semibold text-primary mb-2">No User Profiles Yet</h2>
            <p className="text-muted mb-6">Create a test user to see structured profile data here.</p>
            <Link href="/auth/signup" className="px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90">
              Create Test User
            </Link>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-primary mb-2">No users match your filters</h2>
            <p className="text-muted mb-6">Try adjusting your search criteria or clear filters.</p>
            <button
              onClick={() => {
                setSearchTerm('')
                setExperienceFilter('')
                setBudgetFilter('')
              }}
              className="px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90"
            >
              Clear All Filters
            </button>
          </div>
        ) : viewMode === 'table' ? (
          <div className="bg-card rounded-lg border border-border/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/10">
                  <tr>
                    <th className="text-left p-4 font-medium text-primary">Name</th>
                    <th className="text-left p-4 font-medium text-primary">Experience</th>
                    <th className="text-left p-4 font-medium text-primary">Goal</th>
                    <th className="text-left p-4 font-medium text-primary">Budget</th>
                    <th className="text-left p-4 font-medium text-primary">Deal Types</th>
                    <th className="text-left p-4 font-medium text-primary">Location</th>
                    <th className="text-left p-4 font-medium text-primary">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredProfiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-muted/5">
                      <td className="p-4">
                        <div className="font-medium text-primary">{profile.full_name}</div>
                        <div className="text-xs text-muted">{profile.id.slice(0, 8)}...</div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">{getExperienceLabel(profile.investor_experience)}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">{getGoalLabel(profile.investment_goals)}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">{getBudgetLabel(profile.budget)}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {profile.deal_types?.slice(0, 2).map((type, index) => (
                            <span key={index} className="px-2 py-1 bg-accent/10 text-accent rounded text-xs">
                              {type}
                            </span>
                          ))}
                          {profile.deal_types?.length > 2 && (
                            <span className="text-xs text-muted">+{profile.deal_types.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">{profile.location || 'Not specified'}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">{new Date(profile.created_at).toLocaleDateString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredProfiles.map((profile) => (
              <div key={profile.id} className="bg-card rounded-lg border border-border/60 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-primary">{profile.full_name}</h3>
                    <p className="text-sm text-muted">ID: {profile.id}</p>
                    <p className="text-sm text-muted">
                      Created: {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted">Experience Level</div>
                    <div className="font-medium">{getExperienceLabel(profile.investor_experience)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-primary mb-2">Deal Types</h4>
                    <div className="flex flex-wrap gap-1">
                      {profile.deal_types?.map((type, index) => (
                        <span key={index} className="px-2 py-1 bg-accent/10 text-accent rounded text-xs">
                          {type}
                        </span>
                      )) || <span className="text-muted text-sm">Not specified</span>}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-primary mb-2">Investment Goal</h4>
                    <p className="text-sm">{getGoalLabel(profile.investment_goals)}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-primary mb-2">Budget</h4>
                    <p className="text-sm">{getBudgetLabel(profile.budget)}</p>
                  </div>

                  <div className="md:col-span-2 lg:col-span-3">
                    <h4 className="font-medium text-primary mb-2">Location</h4>
                    <p className="text-sm">{profile.location || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-muted/10 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Instructions</h3>
          <ol className="text-sm text-muted space-y-1">
            <li>1. Run the SQL setup script in Supabase SQL Editor</li>
            <li>2. Create a test user through the signup flow</li>
            <li>3. Refresh this page to see structured profile data</li>
          </ol>
        </div>
      </div>
    </div>
  )
}