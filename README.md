# Dealsletter - AI-Powered Real Estate Investment Analysis Platform

> Professional-grade property analysis and deal evaluation platform for real estate investors

[![Live Demo](https://img.shields.io/badge/demo-live-green)](https://dealsletter.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)

## 🏠 About

Dealsletter transforms the way real estate investors analyze properties by combining institutional-quality financial modeling with AI-powered insights. Built by a real estate investor for investors, the platform analyzes deals across multiple investment strategies and provides actionable recommendations backed by real market data.

**Born from experience:** After analyzing 400+ deals totaling $300M+ in volume and building a newsletter with over 1,000 subscribers, we recognized the need for a scalable, intelligent analysis tool that delivers professional insights instantly.

## ✨ Key Features

### 🎯 Multi-Strategy Analysis
- **Fix & Flip**: ARV-based analysis with holding costs, hard money financing, and profit projections
- **Buy & Hold**: Cash flow modeling, cap rate calculations, and long-term ROI projections  
- **BRRRR**: Multi-phase analysis tracking acquisition, renovation, refinance, and rental income
- **House Hack**: Owner-occupied analysis with effective housing cost calculations

### 🤖 AI-Powered Insights
- Claude AI integration for intelligent deal recommendations
- Natural language explanations of complex financial metrics
- Risk assessment and opportunity identification
- Market context and comparable analysis

### 📊 Professional Analysis Tools
- Real-time property data via RentCast API integration
- Comprehensive financial breakdowns for all strategies
- Investment scoring algorithm (0-100 scale)
- Customizable financing assumptions
- Editable property details and assumptions

### 📈 Portfolio Management
- Analysis history with unlimited storage
- Side-by-side property comparisons
- Performance tracking across multiple deals
- Export and share capabilities

### 💳 Subscription Tiers
- **Free**: 3 analyses/month - Perfect for getting started
- **Pro**: 50 analyses/month at $29/mo - For active investors
- **Pro Plus**: 200 analyses/month at $59/mo - For professionals

All paid plans include a 7-day free trial.

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React** - UI component library
- **Tailwind CSS** - Utility-first styling
- **Vercel** - Deployment and hosting

### Backend
- **Supabase** - PostgreSQL database and authentication
- **Stripe** - Payment processing and subscription management
- **RentCast API** - Real-time property data and valuations
- **Anthropic Claude API** - AI-powered analysis and recommendations

### Key Integrations
- Property data scraping via Apify
- Automated market valuation (AVM) via RentCast
- Secure payment processing with Stripe Checkout
- Real-time webhook processing for subscription events

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Stripe account (test mode for development)
- RentCast API key
- Anthropic API key

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/dealsletter.git
cd dealsletter

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys
```

### Environment Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Price IDs (from Stripe)
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_YEARLY=price_xxx
STRIPE_PRICE_PRO_PLUS_MONTHLY=price_xxx
STRIPE_PRICE_PRO_PLUS_YEARLY=price_xxx

# APIs
RENTCAST_API_KEY=your_rentcast_key
ANTHROPIC_API_KEY=your_anthropic_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup
```bash
# Run Supabase migrations
npx supabase migration up

# Or import the schema manually from schema.sql
```

### Run Development Server
```bash
npm run dev
# Open http://localhost:3000
```

## 📁 Project Structure
```
dealsletter/
├── pages/
│   ├── api/                 # API routes
│   │   ├── stripe/         # Stripe integration endpoints
│   │   └── analysis/       # Property analysis endpoints
│   ├── property-analysis/  # Analysis interface
│   ├── account/            # User account management
│   ├── checkout/           # Stripe checkout flow
│   └── pricing/            # Pricing page
├── components/             # Reusable React components
├── lib/
│   ├── supabase.js        # Supabase client
│   ├── stripe.js          # Stripe helpers
│   └── calculations/      # Financial calculation logic
├── public/                # Static assets
└── styles/                # Global styles
```

## 💡 Core Calculation Logic

### Fix & Flip Analysis
```javascript
// Comprehensive profit calculation
Total Investment = Purchase + Rehab + Closing + Holding Costs
Net Profit = ARV - Total Investment - Selling Costs
ROI = (Net Profit / Cash Required) × 100
```

### Buy & Hold Analysis
```javascript
// Monthly cash flow analysis
Monthly Cash Flow = Total Rent - (Mortgage + Taxes + Insurance + Maintenance + Vacancy + Management)
Cash-on-Cash Return = (Annual Cash Flow / Down Payment) × 100
Cap Rate = (NOI / Purchase Price) × 100
```

### Investment Scoring Algorithm
- Fix & Flip: ROI (50 pts) + Profit Margin (40 pts) + Risk Assessment (10 pts)
- Buy & Hold: Cash-on-Cash (40 pts) + Cap Rate (30 pts) + Cash Flow (20 pts) + Stability (10 pts)
- Scores: 80-100 (Excellent), 60-79 (Good), 40-59 (Marginal), 0-39 (Poor)

## 🔐 Security & Privacy

- Row-level security (RLS) on all database tables
- Secure authentication via Supabase Auth
- API keys stored in environment variables
- PCI-compliant payment processing via Stripe
- User data encrypted at rest and in transit
- GDPR-compliant data handling

## 🧪 Testing
```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 📊 Database Schema

### Core Tables
- `user_profiles` - User data and subscription info
- `property_analyses` - Saved property analyses
- `usage_tracking` - Monthly analysis usage counters

See `schema.sql` for complete database structure.

## 🚢 Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Settings → Environment Variables
```

### Stripe Webhook Setup

1. Add webhook endpoint in Stripe Dashboard
2. Endpoint URL: `https://your-app.vercel.app/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.*`
4. Copy webhook signing secret to environment variables

## 🤝 Contributing

This is a personal project, but feedback and suggestions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Known Issues & Roadmap

### Current Issues
- Mobile optimization in progress
- Property data accuracy depends on RentCast coverage
- Limited to US properties currently

### Planned Features
- [ ] Mobile app (React Native)
- [ ] Property alerts and saved searches
- [ ] Portfolio performance tracking
- [ ] Market trend analysis
- [ ] Collaborative team features
- [ ] API for third-party integrations
- [ ] International market support

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with assistance from Claude AI (Anthropic) for rapid development
- RentCast for reliable property data API
- Stripe for seamless payment infrastructure
- Supabase for backend infrastructure
- The real estate investment community for continuous feedback

## 📧 Contact

**Creator:** kdog (Founder, Dealsletter)
- Website: [dealsletter.io](https://dealsletter.io)
- Email: kevin@dealsletter.io
- Twitter: [@dealsletter](https://twitter.com/dealsletter)

## 💪 About the Founder

Built by a practicing real estate investor and paramedic who codes. Combining hands-on deal experience with technical expertise to create tools that real investors actually need.

- 400+ deals analyzed totaling $300M+ in volume
- 1,000+ newsletter subscribers
- Active investor using BRRRR and flip strategies
- Full-stack developer and EMS professional

---

**⭐ If you find this project useful, please consider starring the repository!**

Built with 💜 by real estate investors, for real estate investors.
