export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  imageUrl: string;
  slug: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "13",
    title: "Bay Area Real Estate Q1 2026: Tight, Split, and Still Moving",
    excerpt:
      "The Bay Area market is split into two worlds: prime SF/Peninsula/Silicon Valley cores are still competitive with sub-1 month supply, while parts of East Bay and North Bay offer more negotiating room. Rates drifting to 5.98%, rents firming at $3,200 avg — here's your county-by-county breakdown and 60-90 day buyer playbook.",
    date: "March 2026",
    readTime: "14 min read",
    category: "Market Analysis",
    imageUrl: "/logos/BAY%20AREA%20Q1.png",
    slug: "bay-area-q1-2026",
  },
  {
    id: "12",
    title:
      "LA Real Estate Q1 2026: The Market Isn't Crashing — It's Just Picky",
    excerpt:
      "LA real estate isn't collapsing—it's selective. Prices aren't running, buyers have breathing room, and only no-brainer properties move fast. Here's your complete submarket breakdown, strategy analysis, and what we're watching heading into spring 2026.",
    date: "February 2026",
    readTime: "15 min read",
    category: "Market Analysis",
    imageUrl: "/logos/LA%20QUARTER%20ONE.png",
    slug: "la-real-estate-q1-2026",
  },
  {
    id: "11",
    title:
      "San Diego County Real Estate Deep Dive: 2025 Actuals + 2026 Investor Playbook",
    excerpt:
      "San Diego normalized in 2025—not crashed, not moonshot. Median held at $900K, inventory climbed to 2.9 months, and 36-44% of listings took price cuts. Here's your complete submarket breakdown with cap rates, strategy analysis, and the investor playbook for 2026.",
    date: "January 2026",
    readTime: "18 min read",
    category: "Market Analysis",
    imageUrl: "/logos/SAN%20DIEGO%20DEEP%20DIVE.png",
    slug: "san-diego-deep-dive-2026",
  },
  {
    id: "10",
    title:
      "End of 2025 Bay Area Housing Deep Dive: All 9 Counties Analyzed",
    excerpt:
      "Our comprehensive end-of-year Bay Area analysis with actual numbers across all 9 counties. The Bay is not one market — it's 9 different markets. Combined median at $1.275M (-3.2% YoY), but SF is up 12.6% while Marin dropped 9.5%. Here's what it means for investors.",
    date: "December 2025",
    readTime: "15 min read",
    category: "Market Analysis",
    imageUrl: "/logos/BAY%20AREA%20DEEP%20DIVE.png",
    slug: "bay-area-housing-eoy-2025",
  },
  {
    id: "9",
    title:
      "San Francisco Office Market: Signs of Life in a Struggling Sector",
    excerpt:
      "SF office vacancy at 31.6% but finally stabilizing. AI firms have leased 5M+ SF with positive absorption for 3 quarters. Trophy assets thrive at $73-103 PSF while Class B/C face 40%+ vacancy. The bifurcated recovery is real.",
    date: "Mid-2025",
    readTime: "12 min read",
    category: "Market Analysis",
    imageUrl: "/logos/SF%20BLOG%20HEADER.png",
    slug: "sf-office-market-2025",
  },
  {
    id: "8",
    title:
      "San Diego Real Estate 2025: The Market Is Finally Taking a Breath",
    excerpt:
      "The San Diego market is in a rare \"calm but competitive\" phase. Prices down 2.8-4.4% YoY, inventory up 29%, but affordability remains brutal at $266K income needed. House hacking 2-4 units is the smartest entry strategy for 2025.",
    date: "December 2024",
    readTime: "10 min read",
    category: "Market Analysis",
    imageUrl: "/logos/SAN%20DIEGO%20BLOG%20HEADER.png",
    slug: "san-diego-market-2025",
  },
  {
    id: "6",
    title:
      "Buying, investing, or just curious? Here is a no BS breakdown for the LA real estate market",
    excerpt:
      "Median home price at $876K, inventory climbing, and nearly half of homes selling below asking. The LA market has shifted from panic-buying to buyer leverage. Here's your complete neighborhood breakdown and investment playbook.",
    date: "January 3, 2025",
    readTime: "10 min read",
    category: "Market Analysis",
    imageUrl: "/logos/la%20real%20estate%20article.png",
    slug: "la-real-estate-market-2025",
  },
  {
    id: "7",
    title:
      "CRE Market Deep Dive: Office is a bloodbath, industrial holding strong, retail surprisingly stable",
    excerpt:
      "The most fragmented CRE market in 15+ years. Office vacancy hits 20.8%, $957B in loans maturing, but industrial and data centers are printing money. Here's our complete sector-by-sector breakdown with the numbers that matter.",
    date: "January 11, 2025",
    readTime: "12 min read",
    category: "Market Analysis",
    imageUrl: "/logos/CRE%20BLOG%20HEADER.png",
    slug: "cre-market-deep-dive-2025",
  },
  {
    id: "1",
    title:
      "Missouri Just Changed the Game for Investors — Here's What It Means for You",
    excerpt:
      "Missouri is about to become the first state in the nation to completely eliminate capital gains tax for individuals. This massive shift will impact how smart investors think about where they do business.",
    date: "November 18, 2024",
    readTime: "4 min read",
    category: "Tax Strategy",
    imageUrl: "/logos/ARTICLE%204.png",
    slug: "missouri-capital-gains-elimination",
  },
  {
    id: "2",
    title:
      'The "One Big, Beautiful Bill" Just Passed — What It Means for Investors, Founders, and People',
    excerpt:
      "A sweeping tax reform that could reshape the game for entrepreneurs, investors, and working-class families alike. Here's what actually matters for your bottom line.",
    date: "November 19, 2024",
    readTime: "6 min read",
    category: "Policy Update",
    imageUrl: "/logos/Article%202.png",
    slug: "big-beautiful-bill-tax-reform",
  },
  {
    id: "3",
    title:
      "June Property Recap — 12 Killer Real Estate Deals We Broke Down",
    excerpt:
      "What's sold, what's pending, what's still available, and what this tells us about where the market is headed. A deep dive into 12 deals across multiple markets.",
    date: "December 28, 2024",
    readTime: "8 min read",
    category: "Deal Recap",
    imageUrl: "/logos/ARTICLE%203.png",
    slug: "june-property-recap-12-deals",
  },
  {
    id: "4",
    title:
      "The Real State of Housing in 2025 (And Why We're Still Buying)",
    excerpt:
      "The inflation-adjusted home price index hit 299.9 — higher than 2006. Everyone's saying \"bubble,\" but here's why this correction will unlock the best buying opportunities in over a decade.",
    date: "December 27, 2024",
    readTime: "7 min read",
    category: "Market Analysis",
    imageUrl: "/logos/ARTICLE%201%20(1).png",
    slug: "real-state-housing-2025",
  },
  {
    id: "5",
    title:
      "Bay Area Real Estate: The Market Shift Every Investor Must Know",
    excerpt:
      "The Bay Area real estate market is experiencing its most significant transformation since the pandemic. After years of frenzied seller's markets, we're seeing increased inventory, moderate price corrections, and genuine buyer leverage.",
    date: "October 15, 2025",
    readTime: "8 min read",
    category: "Market Analysis",
    imageUrl: "/logos/bay%20area%20article%20header.png",
    slug: "bay-area-real-estate-shift",
  },
];

export const getPostsByCategory = (category: string): BlogPost[] => {
  if (category === "All") return blogPosts;
  return blogPosts.filter((p) => p.category === category);
};

export const getBlogCategories = (): string[] => {
  const cats = blogPosts.map((p) => p.category);
  return ["All", ...Array.from(new Set(cats))];
};

export const getPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find((p) => p.slug === slug);
};
