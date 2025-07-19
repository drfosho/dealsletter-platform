'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface SavedProperty {
  id: number;
  title: string;
  location: string;
  price: number;
  savedDate: string;
  type: string;
  status: 'active' | 'sold' | 'pending';
}

interface SavedFilter {
  id: number;
  name: string;
  criteria: {
    priceRange: { min: number; max: number };
    propertyTypes: string[];
    locations: string[];
    strategy: string[];
    minROI?: number;
    minCashFlow?: number;
  };
  createdDate: string;
  notifications: boolean;
}

interface InvestmentStats {
  totalSaved: number;
  activeFilters: number;
  viewedThisMonth: number;
  avgTimeOnSite: string;
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // User profile data
  const [userProfile, setUserProfile] = useState({
    firstName: user?.user_metadata?.first_name || '',
    lastName: user?.user_metadata?.last_name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    bio: user?.user_metadata?.bio || '',
    location: user?.user_metadata?.location || '',
    investmentGoals: user?.user_metadata?.investment_goals || '',
    experience: user?.user_metadata?.experience || 'beginner',
    preferredStrategy: user?.user_metadata?.preferred_strategy || [],
  });

  // Mock data - in production this would come from your database
  const [savedProperties] = useState<SavedProperty[]>([
    {
      id: 1,
      title: "853 S 32nd Street",
      location: "San Diego, CA 92113",
      price: 1295000,
      savedDate: "2024-01-15",
      type: "Opportunity Zone",
      status: 'active'
    },
    {
      id: 4,
      title: "673 Doreen Way",
      location: "Lafayette, CA 94549",
      price: 999900,
      savedDate: "2024-01-18",
      type: "Premium Flip",
      status: 'active'
    },
    {
      id: 6,
      title: "8110 MacArthur Blvd",
      location: "Oakland, CA 94605",
      price: 1850000,
      savedDate: "2024-01-20",
      type: "Value-Add Multifamily",
      status: 'active'
    }
  ]);

  const [savedFilters] = useState<SavedFilter[]>([
    {
      id: 1,
      name: "Bay Area Multifamily",
      criteria: {
        priceRange: { min: 1000000, max: 3000000 },
        propertyTypes: ["Multifamily"],
        locations: ["Oakland", "San Francisco", "San Jose"],
        strategy: ["Buy & Hold", "Value-Add"],
        minROI: 15,
        minCashFlow: 5000
      },
      createdDate: "2024-01-10",
      notifications: true
    },
    {
      id: 2,
      name: "House Hack Opportunities",
      criteria: {
        priceRange: { min: 500000, max: 1200000 },
        propertyTypes: ["Duplex", "Triplex", "Fourplex"],
        locations: ["San Diego", "Los Angeles"],
        strategy: ["House Hack"],
        minROI: 10
      },
      createdDate: "2024-01-05",
      notifications: false
    }
  ]);

  const investmentStats: InvestmentStats = {
    totalSaved: savedProperties.length,
    activeFilters: savedFilters.filter(f => f.notifications).length,
    viewedThisMonth: 47,
    avgTimeOnSite: "12m 34s"
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = () => {
    // In production, this would save to your database
    setIsEditing(false);
    // Show success toast
  };

  const getInitials = () => {
    const first = userProfile.firstName?.[0] || user?.email?.[0] || 'U';
    const last = userProfile.lastName?.[0] || '';
    return (first + last).toUpperCase();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <div className="relative">
                  <Image 
                    src="/logos/Copy of Dealsletter Official Logo Black.svg"
                    alt="Dealsletter Logo"
                    width={180}
                    height={48}
                    className="h-12 w-auto"
                    priority
                    suppressHydrationWarning
                  />
                </div>
              </Link>
              <div className="hidden md:flex items-center space-x-2 ml-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-muted">PROFILE</span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/dashboard" className="px-4 py-2 text-muted hover:text-primary transition-colors font-medium">
                Dashboard
              </Link>
              <Link href="/blog" className="px-4 py-2 text-muted hover:text-primary transition-colors font-medium">
                Blog
              </Link>
              <Link href="/contact" className="px-4 py-2 text-muted hover:text-primary transition-colors font-medium">
                Contact
              </Link>
              <button 
                onClick={() => signOut()}
                className="px-4 py-2 text-muted hover:text-primary transition-colors font-medium"
              >
                Sign Out
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-3 text-muted hover:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Toggle mobile menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-6 py-4 bg-card/95 backdrop-blur-xl border-b border-border/20">
              <div className="flex flex-col space-y-3">
                <Link 
                  href="/dashboard" 
                  className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center rounded-lg hover:bg-muted/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button 
                  onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center rounded-lg hover:bg-muted/10 text-left"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Profile Header Section */}
      <section className="bg-card border-b border-border/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden border-4 border-accent/20">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-accent">{getInitials()}</span>
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                  <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-primary mb-2">
                    {userProfile.firstName} {userProfile.lastName}
                  </h1>
                  <p className="text-muted mb-1">{userProfile.email}</p>
                  <p className="text-sm text-muted mb-4">{userProfile.location || 'Location not set'}</p>
                  
                  {/* Investment Stats */}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-primary">{investmentStats.totalSaved}</p>
                        <p className="text-xs text-muted">Saved Properties</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-primary">{investmentStats.activeFilters}</p>
                        <p className="text-xs text-muted">Active Filters</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-primary">{investmentStats.viewedThisMonth}</p>
                        <p className="text-xs text-muted">Viewed This Month</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => isEditing ? handleProfileUpdate() : setIsEditing(true)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors min-h-[44px] ${
                    isEditing 
                      ? 'bg-green-500 text-white hover:bg-green-600' 
                      : 'bg-primary text-secondary hover:bg-primary/90'
                  }`}
                >
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="bg-muted/5 border-b border-border/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 md:gap-2 overflow-x-auto">
            {['overview', 'saved', 'filters', 'settings'].map((tab) => (
              <button
                key={tab}
                className={`px-4 md:px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap border-b-2 ${
                  activeTab === tab
                    ? 'text-accent border-accent'
                    : 'text-muted hover:text-primary border-transparent'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab === 'saved' && `(${savedProperties.length})`}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* About Section */}
            <div className="bg-card rounded-xl border border-border/60 p-6">
              <h2 className="text-xl font-semibold text-primary mb-4">About</h2>
              {isEditing ? (
                <textarea
                  className="w-full p-4 bg-muted/10 border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 resize-none"
                  rows={4}
                  value={userProfile.bio}
                  onChange={(e) => setUserProfile({...userProfile, bio: e.target.value})}
                  placeholder="Tell us about yourself and your investment journey..."
                />
              ) : (
                <p className="text-muted">
                  {userProfile.bio || 'No bio added yet. Click edit to add information about yourself.'}
                </p>
              )}
            </div>

            {/* Investment Profile */}
            <div className="bg-card rounded-xl border border-border/60 p-6">
              <h2 className="text-xl font-semibold text-primary mb-4">Investment Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-muted block mb-2">Experience Level</label>
                  {isEditing ? (
                    <select 
                      className="w-full p-3 bg-muted/10 border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                      value={userProfile.experience}
                      onChange={(e) => setUserProfile({...userProfile, experience: e.target.value})}
                    >
                      <option value="beginner">Beginner (0-2 years)</option>
                      <option value="intermediate">Intermediate (2-5 years)</option>
                      <option value="advanced">Advanced (5+ years)</option>
                      <option value="expert">Expert (10+ years)</option>
                    </select>
                  ) : (
                    <p className="font-medium text-primary capitalize">{userProfile.experience}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-muted block mb-2">Investment Goals</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="w-full p-3 bg-muted/10 border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                      value={userProfile.investmentGoals}
                      onChange={(e) => setUserProfile({...userProfile, investmentGoals: e.target.value})}
                      placeholder="e.g., Build passive income, Financial freedom"
                    />
                  ) : (
                    <p className="font-medium text-primary">
                      {userProfile.investmentGoals || 'Not specified'}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm text-muted block mb-2">Preferred Investment Strategies</label>
                  {isEditing ? (
                    <div className="flex flex-wrap gap-2">
                      {['BRRRR', 'Fix & Flip', 'Buy & Hold', 'House Hack', 'Multifamily', 'Short-term Rental'].map((strategy) => (
                        <label key={strategy} className="flex items-center">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={userProfile.preferredStrategy.includes(strategy)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setUserProfile({
                                  ...userProfile, 
                                  preferredStrategy: [...userProfile.preferredStrategy, strategy]
                                });
                              } else {
                                setUserProfile({
                                  ...userProfile,
                                  preferredStrategy: userProfile.preferredStrategy.filter(s => s !== strategy)
                                });
                              }
                            }}
                          />
                          <span className={`px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                            userProfile.preferredStrategy.includes(strategy)
                              ? 'bg-accent/10 border-accent text-accent'
                              : 'bg-muted/10 border-border/60 text-muted hover:border-accent/50'
                          }`}>
                            {strategy}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {userProfile.preferredStrategy.length > 0 ? (
                        userProfile.preferredStrategy.map((strategy) => (
                          <span key={strategy} className="px-4 py-2 bg-accent/10 text-accent rounded-lg">
                            {strategy}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted">No strategies selected</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card rounded-xl border border-border/60 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">Member Since</span>
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-primary">Jan 2024</p>
              </div>

              <div className="bg-card rounded-xl border border-border/60 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">Properties Viewed</span>
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-primary">156</p>
              </div>

              <div className="bg-card rounded-xl border border-border/60 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">Avg. Time on Site</span>
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-primary">{investmentStats.avgTimeOnSite}</p>
              </div>

              <div className="bg-card rounded-xl border border-border/60 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">Profile Views</span>
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-primary">23</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-primary">Saved Properties</h2>
              <select className="px-4 py-2 bg-card border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20">
                <option value="recent">Recently Saved</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProperties.map((property) => (
                <div key={property.id} className="bg-card rounded-xl border border-border/60 overflow-hidden hover:shadow-lg transition-all duration-200">
                  <div className="relative h-48 bg-muted/20">
                    <div className="absolute top-4 left-4 z-10">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        property.status === 'active' ? 'bg-green-500/20 text-green-600' :
                        property.status === 'pending' ? 'bg-yellow-500/20 text-yellow-600' :
                        'bg-red-500/20 text-red-600'
                      }`}>
                        {property.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4 z-10">
                      <button className="w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors">
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="text-xs opacity-80">Saved {new Date(property.savedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-primary mb-1">{property.title}</h3>
                    <p className="text-sm text-muted mb-2">{property.location}</p>
                    <p className="text-sm text-muted mb-4">{property.type}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-accent">${property.price.toLocaleString()}</span>
                      <Link 
                        href={`/dashboard?property=${property.id}`}
                        className="px-4 py-2 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {savedProperties.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-primary mb-2">No saved properties yet</h3>
                <p className="text-muted mb-4">Start exploring deals and save your favorites!</p>
                <Link 
                  href="/dashboard"
                  className="inline-flex px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Browse Properties
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'filters' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-primary">Saved Filters</h2>
              <button className="px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium">
                Create New Filter
              </button>
            </div>

            <div className="space-y-4">
              {savedFilters.map((filter) => (
                <div key={filter.id} className="bg-card rounded-xl border border-border/60 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-primary mb-1">{filter.name}</h3>
                      <p className="text-sm text-muted">Created {new Date(filter.createdDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={filter.notifications} />
                        <div className="w-11 h-6 bg-muted/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                        <span className="ml-2 text-sm text-muted">Alerts</span>
                      </label>
                      <button className="p-2 text-muted hover:text-primary transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="p-2 text-red-500 hover:text-red-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-muted/10 rounded-lg p-3">
                      <p className="text-xs text-muted mb-1">Price Range</p>
                      <p className="font-medium text-primary">
                        ${filter.criteria.priceRange.min.toLocaleString()} - ${filter.criteria.priceRange.max.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="bg-muted/10 rounded-lg p-3">
                      <p className="text-xs text-muted mb-1">Property Types</p>
                      <p className="font-medium text-primary">{filter.criteria.propertyTypes.join(', ')}</p>
                    </div>
                    
                    <div className="bg-muted/10 rounded-lg p-3">
                      <p className="text-xs text-muted mb-1">Locations</p>
                      <p className="font-medium text-primary">{filter.criteria.locations.join(', ')}</p>
                    </div>
                    
                    {filter.criteria.minROI && (
                      <div className="bg-muted/10 rounded-lg p-3">
                        <p className="text-xs text-muted mb-1">Min ROI</p>
                        <p className="font-medium text-primary">{filter.criteria.minROI}%</p>
                      </div>
                    )}
                    
                    {filter.criteria.minCashFlow && (
                      <div className="bg-muted/10 rounded-lg p-3">
                        <p className="text-xs text-muted mb-1">Min Cash Flow</p>
                        <p className="font-medium text-primary">${filter.criteria.minCashFlow}/mo</p>
                      </div>
                    )}
                    
                    <div className="bg-muted/10 rounded-lg p-3">
                      <p className="text-xs text-muted mb-1">Strategy</p>
                      <p className="font-medium text-primary">{filter.criteria.strategy.join(', ')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {savedFilters.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-primary mb-2">No saved filters yet</h3>
                <p className="text-muted mb-4">Create custom filters to get notified about matching properties!</p>
                <button className="inline-flex px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium">
                  Create Your First Filter
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-primary mb-6">Settings & Preferences</h2>

            {/* Contact Information */}
            <div className="bg-card rounded-xl border border-border/60 p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-muted block mb-2">Email Address</label>
                  <input
                    type="email"
                    className="w-full p-3 bg-muted/10 border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                    value={userProfile.email}
                    disabled
                  />
                </div>
                <div>
                  <label className="text-sm text-muted block mb-2">Phone Number</label>
                  <input
                    type="tel"
                    className="w-full p-3 bg-muted/10 border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                    value={userProfile.phone}
                    onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted block mb-2">Location</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-muted/10 border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                    value={userProfile.location}
                    onChange={(e) => setUserProfile({...userProfile, location: e.target.value})}
                    placeholder="City, State"
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-card rounded-xl border border-border/60 p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-primary">Email Notifications</p>
                    <p className="text-sm text-muted">Receive updates about new properties matching your filters</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 text-accent" defaultChecked />
                </label>
                
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-primary">SMS Alerts</p>
                    <p className="text-sm text-muted">Get instant alerts for hot deals</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 text-accent" />
                </label>
                
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-primary">Weekly Newsletter</p>
                    <p className="text-sm text-muted">Curated deals and market insights</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 text-accent" defaultChecked />
                </label>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-card rounded-xl border border-border/60 p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Privacy Settings</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-primary">Profile Visibility</p>
                    <p className="text-sm text-muted">Allow other members to view your profile</p>
                  </div>
                  <select className="px-4 py-2 bg-muted/10 border border-border/60 rounded-lg">
                    <option value="public">Public</option>
                    <option value="members">Members Only</option>
                    <option value="private">Private</option>
                  </select>
                </label>
                
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-primary">Show Investment Activity</p>
                    <p className="text-sm text-muted">Display your saved properties and filters</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 text-accent" />
                </label>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/10 rounded-xl border border-red-500/20 p-6">
              <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-primary">Delete Account</p>
                  <p className="text-sm text-muted">Permanently delete your account and all data</p>
                </div>
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}