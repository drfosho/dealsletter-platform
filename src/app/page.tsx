export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary gradient-animate">
      {/* Navigation */}
      <nav className="fixed top-0 w-full px-6 py-4 backdrop-blur-glass z-50 border-b border-border/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <span className="text-2xl font-bold text-primary">
                Dealsletter
              </span>
              <div className="text-xs text-muted font-medium tracking-wide">
                PLATFORM
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <button className="px-6 py-2 text-primary hover:text-accent transition-colors font-medium">
              Dashboard
            </button>
            <button className="px-6 py-2 text-primary hover:text-accent transition-colors font-medium">
              Deals
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-accent to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-accent/25 transition-all duration-300 font-medium">
              Add Deal
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-32 pt-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-semibold tracking-wide border border-accent/20">
              🏆 #1 Real Estate Analysis Platform
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-primary mb-8 tracking-tight">
            Analyze Real Estate
            <span className="block bg-gradient-to-r from-accent via-blue-600 to-accent bg-clip-text text-transparent gradient-animate">
              Like a Pro
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted mb-12 max-w-4xl mx-auto leading-relaxed">
            Discover profitable real estate investments with AI-powered analysis, 
            comprehensive metrics, and real-time deal monitoring that gives you the edge.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <button className="group px-8 py-4 bg-gradient-to-r from-accent to-blue-600 text-white rounded-xl hover:shadow-xl hover:shadow-accent/30 transition-all duration-300 font-semibold text-lg flex items-center justify-center space-x-2">
              <span>Start Analyzing Deals</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <button className="px-8 py-4 border-2 border-primary/20 text-primary rounded-xl hover:bg-primary hover:text-secondary transition-all duration-300 font-semibold text-lg backdrop-blur-sm">
              View Demo
            </button>
          </div>
          
          {/* Floating Cards Preview */}
          <div className="relative">
            <div className="absolute left-1/2 top-8 transform -translate-x-1/2 w-80 h-48 bg-gradient-to-br from-card to-card/80 rounded-2xl shadow-2xl backdrop-blur-sm border border-border/20 p-6 float-animation">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-green-500/20 text-green-600 rounded-full text-sm font-medium">
                  Qualified
                </span>
                <span className="text-muted text-sm">Live Analysis</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">
                123 Investment Ave
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted">Cash Flow</span>
                  <span className="font-bold text-green-600">+$1,250/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Cap Rate</span>
                  <span className="font-bold text-accent">12.5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 backdrop-blur-sm border-y border-border/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="text-5xl font-bold bg-gradient-to-r from-accent to-blue-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                2,847
              </div>
              <div className="text-muted font-medium">Deals Analyzed</div>
            </div>
            <div className="text-center group">
              <div className="text-5xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                $12.4M
              </div>
              <div className="text-muted font-medium">Total Investment</div>
            </div>
            <div className="text-center group">
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                23.5%
              </div>
              <div className="text-muted font-medium">Avg. ROI</div>
            </div>
            <div className="text-center group">
              <div className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                156
              </div>
              <div className="text-muted font-medium">Active Investors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section className="px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
              Professional-Grade Analysis
            </h2>
            <p className="text-xl text-muted max-w-3xl mx-auto">
              Built for serious real estate investors who demand precision, speed, and insight
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group p-8 bg-gradient-to-br from-card to-card/80 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border/20">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">
                Real-time Analytics
              </h3>
              <p className="text-muted leading-relaxed">
                Instant calculations with live market data. Get immediate insights on cash flow, cap rates, and ROI projections.
              </p>
            </div>

            <div className="group p-8 bg-gradient-to-br from-card to-card/80 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border/20">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">
                AI Deal Scoring
              </h3>
              <p className="text-muted leading-relaxed">
                Advanced machine learning algorithms evaluate every deal factor to identify the highest-potential opportunities.
              </p>
            </div>

            <div className="group p-8 bg-gradient-to-br from-card to-card/80 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border/20">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">
                Market Intelligence
              </h3>
              <p className="text-muted leading-relaxed">
                Comprehensive market analysis with trending data, comparable sales, and predictive modeling for informed decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Deals Section - Enhanced */}
      <section className="px-6 py-24 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-primary mb-4">
                Recent Deals
              </h2>
              <p className="text-xl text-muted">
                Live analysis results from our platform
              </p>
            </div>
            <button className="px-6 py-3 bg-accent text-white rounded-xl hover:bg-blue-600 transition-colors font-medium flex items-center space-x-2">
              <span>View All Deals</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Enhanced Deal Cards */}
            <div className="group bg-gradient-to-br from-card to-card/80 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-border/20">
              <div className="flex items-center justify-between mb-6">
                <span className="px-4 py-2 bg-green-500/20 text-green-600 rounded-full text-sm font-semibold">
                  Excellent Deal
                </span>
                <span className="text-muted text-sm">2 hours ago</span>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-3">
                123 Investment Ave
              </h3>
              <p className="text-muted mb-6">
                Single Family • 3 bed, 2 bath • 1,850 sq ft
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted">Purchase Price</span>
                  <span className="font-bold text-primary text-lg">$285,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Monthly Rent</span>
                  <span className="font-bold text-primary text-lg">$2,850</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Cash Flow</span>
                  <span className="font-bold text-green-600 text-lg">+$1,250/mo</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Cap Rate</span>
                  <span className="font-bold text-accent text-lg">12.5%</span>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-card to-card/80 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-border/20">
              <div className="flex items-center justify-between mb-6">
                <span className="px-4 py-2 bg-blue-500/20 text-blue-600 rounded-full text-sm font-semibold">
                  Good Deal
                </span>
                <span className="text-muted text-sm">5 hours ago</span>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-3">
                456 Oak Street
              </h3>
              <p className="text-muted mb-6">
                Duplex • 2 units, 4 bed total • 2,400 sq ft
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted">Purchase Price</span>
                  <span className="font-bold text-primary text-lg">$385,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Monthly Rent</span>
                  <span className="font-bold text-primary text-lg">$3,200</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Cash Flow</span>
                  <span className="font-bold text-green-600 text-lg">+$875/mo</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Cap Rate</span>
                  <span className="font-bold text-accent text-lg">9.2%</span>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-card to-card/80 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-border/20">
              <div className="flex items-center justify-between mb-6">
                <span className="px-4 py-2 bg-yellow-500/20 text-yellow-600 rounded-full text-sm font-semibold">
                  Under Review
                </span>
                <span className="text-muted text-sm">1 day ago</span>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-3">
                789 Pine Boulevard
              </h3>
              <p className="text-muted mb-6">
                Townhouse • 3 bed, 2.5 bath • 2,100 sq ft
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted">Purchase Price</span>
                  <span className="font-bold text-primary text-lg">$425,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Monthly Rent</span>
                  <span className="font-bold text-primary text-lg">$2,900</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Cash Flow</span>
                  <span className="font-bold text-yellow-600 text-lg">+$485/mo</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Cap Rate</span>
                  <span className="font-bold text-accent text-lg">7.8%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Ready to Find Your Next 
            <span className="block bg-gradient-to-r from-accent to-blue-600 bg-clip-text text-transparent">
              Investment Winner?
            </span>
          </h2>
          <p className="text-xl text-muted mb-10 max-w-2xl mx-auto">
            Join hundreds of successful investors who trust our platform to identify profitable real estate opportunities.
          </p>
          <button className="px-12 py-4 bg-gradient-to-r from-accent to-blue-600 text-white rounded-xl hover:shadow-xl hover:shadow-accent/30 transition-all duration-300 font-bold text-xl">
            Start Your Free Trial
          </button>
          <p className="text-muted mt-4">
            No credit card required • Full access for 14 days
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-border/20 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">D</span>
            </div>
            <span className="text-xl font-bold text-primary">Dealsletter Platform</span>
          </div>
          <p className="text-muted mb-4">
            Professional real estate analysis tools for serious investors
          </p>
          <p className="text-muted text-sm">
            © 2024 Dealsletter Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}