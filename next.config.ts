import type { NextConfig } from "next";

// Content-Security-Policy directives
// Kept readable — joined into one header value below.
const cspDirectives = [
  "default-src 'self'",
  // Scripts: self + inline for Next.js hydration, Google Maps, Stripe, Vercel analytics
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://js.stripe.com https://va.vercel-scripts.com",
  // Styles: self + inline for Tailwind / runtime-injected styles
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Images: self + data URIs + the domains already in remotePatterns + map tiles + Stripe
  "img-src 'self' data: blob: https://maps.googleapis.com https://maps.gstatic.com https://images.unsplash.com https://*.googleusercontent.com https://*.stripe.com",
  // Fonts
  "font-src 'self' https://fonts.gstatic.com",
  // Connect (API calls): self + Supabase + Stripe + Google + RentCast + Vercel analytics
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://maps.googleapis.com https://api.rentcast.io https://va.vercel-scripts.com",
  // Frames: only Stripe checkout / 3-D Secure
  "frame-src https://js.stripe.com https://hooks.stripe.com",
  // Object / base / form
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // Block all <object>, <embed>, <applet>
  "plugin-types 'none'",
  // Upgrade insecure requests in production
  "upgrade-insecure-requests",
];

const ContentSecurityPolicy = cspDirectives.join('; ');

const securityHeaders = [
  // --- STRICT in production ---
  {
    // HSTS: tell browsers to always use HTTPS for 2 years + include subdomains.
    // Strict: yes — prevents SSL-stripping attacks entirely.
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    // CSP: allowlist of permitted resource origins.
    // Strict: the most impactful header — blocks XSS, data exfiltration, and
    // clickjacking via frame-src. unsafe-inline/eval are required by Next.js
    // hydration; tighten with nonces if you adopt a custom Document.
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy,
  },
  {
    // Prevent MIME-type sniffing (e.g., treating an uploaded .txt as HTML).
    // Strict: yes — no reason to ever relax this.
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    // Block the page from being embedded in frames on other origins.
    // Strict: yes — prevents clickjacking. SAMEORIGIN allows your own iframes.
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    // Control how much referrer info is sent with outbound navigations.
    // Strict: strict-origin-when-cross-origin is the best balance — sends the
    // origin (not full URL path) on cross-origin requests, full referrer for
    // same-origin. Protects query strings with tokens/ids from leaking.
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },

  // --- MODERATE ---
  {
    // Opts out of Google FLoC / Topics API tracking.
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
  },
  {
    // Legacy XSS filter (Chrome removed it, but some browsers still honour it).
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    // Prevent DNS prefetching of external links to avoid privacy leaks.
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // TODO: re-add maps.googleapis.com when Google Maps API is configured
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'Vercel-CDN-Cache-Control',
            value: 'no-store',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'no-store',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Redirect V1 auth pages to V2
      {
        source: '/login',
        destination: '/v2/login',
        permanent: false,
      },
      {
        source: '/signup',
        destination: '/v2/signup',
        permanent: false,
      },
      {
        source: '/register',
        destination: '/v2/signup',
        permanent: false,
      },
      // Redirect V1 main pages to V2
      {
        source: '/pricing',
        destination: '/v2/pricing',
        permanent: false,
      },
      {
        source: '/blog',
        destination: '/v2/blog',
        permanent: false,
      },
      {
        source: '/blog/:slug',
        destination: '/v2/blog/:slug',
        permanent: false,
      },
      {
        source: '/faq',
        destination: '/v2/faq',
        permanent: false,
      },
      {
        source: '/contact',
        destination: '/v2/contact',
        permanent: false,
      },
      {
        source: '/privacy',
        destination: '/v2/privacy',
        permanent: false,
      },
      {
        source: '/terms',
        destination: '/v2/terms',
        permanent: false,
      },
      // Redirect V1 account pages to V2
      {
        source: '/account',
        destination: '/v2/account',
        permanent: false,
      },
      {
        source: '/account/:path*',
        destination: '/v2/account',
        permanent: false,
      },
      // Redirect V1 analysis pages to V2
      {
        source: '/analysis',
        destination: '/v2',
        permanent: false,
      },
      {
        source: '/analysis/:path*',
        destination: '/v2',
        permanent: false,
      },
      {
        source: '/dashboard',
        destination: '/v2/dashboard',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
