"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, ComponentType } from "react";
import { getPostBySlug, blogPosts } from "@/data/blog-posts";
import NavBar from "@/components/v2/NavBar";

/* ------------------------------------------------------------------ */
/*  V2 dark theme overrides for V1 article content                     */
/* ------------------------------------------------------------------ */

const articleStyles = `
  .v2-article {
    font-size: 15px;
    color: #6b6690;
    line-height: 1.85;
  }
  .v2-article h1 {
    font-size: 28px;
    font-weight: 700;
    color: #f0eeff;
    letter-spacing: -0.5px;
    margin: 32px 0 14px;
    line-height: 1.2;
  }
  .v2-article h2 {
    font-size: 22px;
    font-weight: 700;
    color: #f0eeff;
    letter-spacing: -0.3px;
    margin: 36px 0 14px;
    padding-bottom: 10px;
    border-bottom: 0.5px solid rgba(127,119,221,0.15);
    line-height: 1.3;
  }
  .v2-article h3 {
    font-size: 17px;
    font-weight: 700;
    color: #e8e6f0;
    margin: 28px 0 10px;
  }
  .v2-article h4 {
    font-size: 15px;
    font-weight: 600;
    color: #d8d4f4;
    margin: 20px 0 8px;
  }
  .v2-article p {
    font-size: 15px;
    color: #6b6690;
    line-height: 1.85;
    margin-bottom: 18px;
  }
  .v2-article strong, .v2-article b {
    color: #e8e6f0;
    font-weight: 600;
  }
  .v2-article em, .v2-article i {
    color: #9994b8;
    font-style: italic;
  }
  .v2-article ul {
    margin: 14px 0 18px 20px;
    list-style: disc;
  }
  .v2-article ol {
    margin: 14px 0 18px 20px;
    list-style: decimal;
  }
  .v2-article li {
    font-size: 15px;
    color: #6b6690;
    line-height: 1.7;
    margin-bottom: 8px;
    padding-left: 4px;
  }
  .v2-article li strong {
    color: #e8e6f0;
  }
  .v2-article blockquote {
    border-left: 2px solid #534AB7 !important;
    padding: 14px 18px !important;
    margin: 24px 0 !important;
    background: rgba(83,74,183,0.06) !important;
    border-radius: 0 8px 8px 0 !important;
    border-top: none !important;
    border-right: none !important;
    border-bottom: none !important;
  }
  .v2-article blockquote p {
    color: #9994b8 !important;
    font-style: italic;
    margin: 0 !important;
  }
  .v2-article table {
    width: 100%;
    border-collapse: collapse;
    margin: 24px 0;
    font-size: 14px;
    background: transparent;
  }
  .v2-article thead {
    background: rgba(127,119,221,0.06);
  }
  .v2-article th {
    background: rgba(127,119,221,0.08) !important;
    color: #9994b8 !important;
    padding: 10px 14px !important;
    text-align: left !important;
    font-weight: 600 !important;
    border-bottom: 0.5px solid rgba(127,119,221,0.2) !important;
    border-color: rgba(127,119,221,0.2) !important;
  }
  .v2-article td {
    padding: 10px 14px !important;
    color: #6b6690 !important;
    border-bottom: 0.5px solid rgba(127,119,221,0.08) !important;
    border-color: rgba(127,119,221,0.08) !important;
  }
  .v2-article tr:hover td {
    background: rgba(127,119,221,0.03) !important;
  }
  .v2-article a {
    color: #7F77DD !important;
    text-decoration: underline;
    text-decoration-color: rgba(127,119,221,0.3);
  }
  .v2-article a:hover {
    color: #c0baf0 !important;
  }
  .v2-article img {
    width: 100%;
    border-radius: 10px;
    margin: 24px 0;
    border: 0.5px solid rgba(127,119,221,0.15);
    display: block;
  }
  .v2-article hr {
    border: none !important;
    border-top: 0.5px solid rgba(127,119,221,0.15) !important;
    margin: 32px 0 !important;
  }

  /* Override ALL V1 background colors */
  .v2-article .bg-white,
  .v2-article .bg-gray-50,
  .v2-article .bg-gray-100,
  .v2-article .bg-slate-50,
  .v2-article .bg-slate-100,
  .v2-article .bg-card,
  .v2-article .bg-muted,
  .v2-article .bg-background,
  .v2-article .bg-secondary {
    background: #13121d !important;
  }
  .v2-article .bg-blue-50,
  .v2-article .bg-blue-100,
  .v2-article .bg-indigo-50 {
    background: rgba(83,74,183,0.08) !important;
  }
  .v2-article .bg-green-50,
  .v2-article .bg-emerald-50 {
    background: rgba(29,158,117,0.08) !important;
  }
  .v2-article .bg-red-50,
  .v2-article .bg-rose-50 {
    background: rgba(240,149,149,0.08) !important;
  }
  .v2-article .bg-amber-50,
  .v2-article .bg-yellow-50,
  .v2-article .bg-orange-50 {
    background: rgba(239,159,39,0.08) !important;
  }

  /* Override ALL V1 text colors */
  .v2-article .text-primary,
  .v2-article .text-foreground,
  .v2-article .text-gray-900,
  .v2-article .text-gray-800,
  .v2-article .text-slate-900,
  .v2-article .text-slate-800,
  .v2-article .text-black {
    color: #f0eeff !important;
  }
  .v2-article .text-secondary,
  .v2-article .text-muted-foreground,
  .v2-article .text-gray-600,
  .v2-article .text-gray-500,
  .v2-article .text-slate-600,
  .v2-article .text-slate-500 {
    color: #6b6690 !important;
  }
  .v2-article .text-gray-400,
  .v2-article .text-slate-400,
  .v2-article .text-muted {
    color: #4e4a6a !important;
  }
  .v2-article .text-green-600,
  .v2-article .text-green-700,
  .v2-article .text-emerald-600,
  .v2-article .text-green-500 {
    color: #1D9E75 !important;
  }
  .v2-article .text-red-600,
  .v2-article .text-red-700,
  .v2-article .text-red-500,
  .v2-article .text-rose-600 {
    color: #f09595 !important;
  }
  .v2-article .text-blue-600,
  .v2-article .text-blue-700,
  .v2-article .text-blue-500,
  .v2-article .text-indigo-600 {
    color: #7F77DD !important;
  }
  .v2-article .text-amber-600,
  .v2-article .text-yellow-600,
  .v2-article .text-orange-600 {
    color: #EF9F27 !important;
  }
  .v2-article .text-purple-600,
  .v2-article .text-violet-600,
  .v2-article .text-accent {
    color: #9994b8 !important;
  }

  /* Override ALL V1 border colors */
  .v2-article .border,
  .v2-article .border-t,
  .v2-article .border-b,
  .v2-article .border-l,
  .v2-article .border-r,
  .v2-article .border-border {
    border-color: rgba(127,119,221,0.2) !important;
  }
  .v2-article .border-green-200,
  .v2-article .border-emerald-200 {
    border-color: rgba(29,158,117,0.25) !important;
  }
  .v2-article .border-red-200,
  .v2-article .border-rose-200 {
    border-color: rgba(240,149,149,0.25) !important;
  }
  .v2-article .border-blue-200,
  .v2-article .border-indigo-200 {
    border-color: rgba(127,119,221,0.25) !important;
  }
  .v2-article .border-amber-200,
  .v2-article .border-yellow-200 {
    border-color: rgba(239,159,39,0.25) !important;
  }
  .v2-article .border-l-4 {
    border-left: 2px solid #534AB7 !important;
  }
  .v2-article .border-l-2 {
    border-left: 2px solid rgba(127,119,221,0.3) !important;
  }

  /* Card and container overrides */
  .v2-article .rounded-lg,
  .v2-article .rounded-xl,
  .v2-article .rounded-md {
    border-radius: 10px !important;
  }
  .v2-article .p-4,
  .v2-article .p-5,
  .v2-article .p-6 {
    padding: 16px 20px !important;
  }
  .v2-article .shadow,
  .v2-article .shadow-sm,
  .v2-article .shadow-md {
    box-shadow: none !important;
    border: 0.5px solid rgba(127,119,221,0.2) !important;
  }

  /* Callout/highlight boxes */
  .v2-article .callout,
  .v2-article [class*="callout"],
  .v2-article .highlight-box,
  .v2-article .info-box,
  .v2-article .note-box {
    background: rgba(83,74,183,0.08) !important;
    border: 0.5px solid rgba(127,119,221,0.2) !important;
    border-radius: 10px !important;
    padding: 16px 20px !important;
    margin: 20px 0 !important;
  }

  /* Stat/metric grids */
  .v2-article .grid {
    display: grid;
    gap: 12px;
  }
  .v2-article .grid-cols-2 {
    grid-template-columns: repeat(2, 1fr) !important;
  }
  .v2-article .grid-cols-3 {
    grid-template-columns: repeat(3, 1fr) !important;
  }
  .v2-article .grid-cols-4 {
    grid-template-columns: repeat(2, 1fr) !important;
  }
  @media (min-width: 640px) {
    .v2-article .sm\\:grid-cols-3 {
      grid-template-columns: repeat(3, 1fr) !important;
    }
  }
  @media (min-width: 768px) {
    .v2-article .md\\:grid-cols-2 {
      grid-template-columns: repeat(2, 1fr) !important;
    }
    .v2-article .md\\:grid-cols-3 {
      grid-template-columns: repeat(3, 1fr) !important;
    }
  }

  /* Flex utilities */
  .v2-article .flex { display: flex; }
  .v2-article .items-center { align-items: center; }
  .v2-article .items-start { align-items: flex-start; }
  .v2-article .justify-between { justify-content: space-between; }
  .v2-article .gap-2 { gap: 8px; }
  .v2-article .gap-4 { gap: 16px; }
  .v2-article .gap-6 { gap: 24px; }

  /* Spacing utilities */
  .v2-article .mb-0 { margin-bottom: 0; }
  .v2-article .mb-2 { margin-bottom: 8px; }
  .v2-article .mb-3 { margin-bottom: 12px; }
  .v2-article .mb-4 { margin-bottom: 16px; }
  .v2-article .mb-6 { margin-bottom: 24px; }
  .v2-article .mb-8 { margin-bottom: 32px; }
  .v2-article .mt-1 { margin-top: 4px; }
  .v2-article .mt-2 { margin-top: 8px; }
  .v2-article .mt-4 { margin-top: 16px; }
  .v2-article .mt-6 { margin-top: 24px; }
  .v2-article .mt-8 { margin-top: 32px; }
  .v2-article .mt-12 { margin-top: 48px; }
  .v2-article .my-8 { margin-top: 32px; margin-bottom: 32px; }
  .v2-article .py-4 { padding-top: 16px; padding-bottom: 16px; }
  .v2-article .py-6 { padding-top: 24px; padding-bottom: 24px; }
  .v2-article .pt-8 { padding-top: 32px; }
  .v2-article .pl-6 { padding-left: 24px; }

  .v2-article .space-y-6 > * + * { margin-top: 24px; }
  .v2-article .space-y-4 > * + * { margin-top: 16px; }
  .v2-article .space-y-2 > * + * { margin-top: 8px; }
  .v2-article .space-y-1 > * + * { margin-top: 4px; }

  /* Font weight utilities */
  .v2-article .font-bold,
  .v2-article .font-semibold {
    font-weight: 600;
    color: #e8e6f0;
  }
  .v2-article .font-medium {
    font-weight: 500;
  }

  /* Text size utilities */
  .v2-article .text-sm { font-size: 13px !important; }
  .v2-article .text-xs { font-size: 11px !important; color: #4e4a6a !important; }
  .v2-article .text-lg { font-size: 17px !important; }
  .v2-article .text-xl { font-size: 19px !important; color: #e8e6f0 !important; }
  .v2-article .text-2xl { font-size: 22px !important; color: #f0eeff !important; font-weight: 700 !important; }
  .v2-article .text-3xl { font-size: 26px !important; color: #f0eeff !important; font-weight: 700 !important; }
  .v2-article .text-4xl { font-size: 30px !important; color: #f0eeff !important; font-weight: 700 !important; }
  .v2-article .text-center { text-align: center; }

  /* Badge/pill overrides */
  .v2-article .px-3.py-1,
  .v2-article [class*="bg-accent/10"] {
    background: rgba(83,74,183,0.2) !important;
    color: #9994b8 !important;
    border: 0.5px solid rgba(127,119,221,0.3) !important;
    border-radius: 20px !important;
  }

  /* V1 accent backgrounds */
  .v2-article [class*="bg-accent/5"],
  .v2-article [class*="bg-primary/5"] {
    background: rgba(83,74,183,0.06) !important;
  }
  .v2-article [class*="bg-green-500/10"] {
    background: rgba(29,158,117,0.08) !important;
  }
  .v2-article [class*="bg-red-500/10"] {
    background: rgba(240,149,149,0.08) !important;
  }

  /* Hide V1 navigation and chrome */
  .v2-article nav,
  .v2-article [class*="fixed top-0"],
  .v2-article [class*="backdrop-blur"],
  .v2-article [class*="blog-navigation"],
  .v2-article [class*="mobile-menu"],
  .v2-article .breadcrumb,
  .v2-article [class*="breadcrumb"] {
    display: none !important;
  }

  /* V1 gradient backgrounds */
  .v2-article [class*="bg-gradient-to-r"],
  .v2-article [class*="bg-gradient-to-br"],
  .v2-article [class*="bg-gradient-to-b"] {
    background: rgba(83,74,183,0.06) !important;
  }

  /* Prose override for Tailwind typography plugin */
  .v2-article .prose { color: #6b6690 !important; max-width: none !important; }
  .v2-article .prose-lg { font-size: 15px !important; }
  .v2-article .prose h1, .v2-article .prose h2,
  .v2-article .prose h3, .v2-article .prose h4 { color: #f0eeff !important; }
  .v2-article .prose p, .v2-article .prose li { color: #6b6690 !important; }
  .v2-article .prose strong { color: #e8e6f0 !important; }
  .v2-article .prose a { color: #7F77DD !important; }
  .v2-article .prose thead th { color: #9994b8 !important; background: rgba(127,119,221,0.08) !important; }
  .v2-article .prose tbody td { color: #6b6690 !important; border-color: rgba(127,119,221,0.1) !important; }
  .v2-article .prose blockquote { border-left-color: #534AB7 !important; color: #9994b8 !important; background: rgba(83,74,183,0.06) !important; }
  .v2-article .prose hr { border-color: rgba(127,119,221,0.15) !important; }

  /* Remove V1 padding that conflicts */
  .v2-article .pt-32 { padding-top: 0 !important; }
  .v2-article .px-4, .v2-article .px-6 { padding-left: 0 !important; padding-right: 0 !important; }
  .v2-article .pb-20 { padding-bottom: 0 !important; }
  .v2-article .min-h-screen { min-height: auto !important; }

  /* Force dark on all children */
  .v2-article * { border-color: rgba(127,119,221,0.15); }
  .v2-article div, .v2-article section,
  .v2-article article, .v2-article aside { background-color: transparent; }

  /* Divider lines */
  .v2-article .divide-y > * + * { border-top: 0.5px solid rgba(127,119,221,0.1) !important; }

  /* Width constraints */
  .v2-article .max-w-4xl { max-width: none !important; }
  .v2-article .max-w-none { max-width: none !important; }
  .v2-article .mx-auto { margin-left: 0 !important; margin-right: 0 !important; }

  /* Inline-block and display */
  .v2-article .inline-block { display: inline-block; }
  .v2-article .block { display: block; }
  .v2-article .hidden { display: none !important; }
  .v2-article .w-full { width: 100%; }
  .v2-article .w-4 { width: 16px; }
  .v2-article .h-4 { height: 16px; }

  /* Transition overrides */
  .v2-article .transition-colors { transition: color 0.15s; }
  .v2-article .hover\\:text-accent\\/80:hover { color: #c0baf0 !important; }
  .v2-article .hover\\:border-accent\\/50:hover { border-color: rgba(127,119,221,0.5) !important; }

  /* Leading/tracking */
  .v2-article .leading-relaxed { line-height: 1.8; }
  .v2-article .leading-tight { line-height: 1.3; }
`;

/* ------------------------------------------------------------------ */
/*  Dynamic V1 content loader                                          */
/* ------------------------------------------------------------------ */

const contentLoaders: Record<string, () => Promise<{ default: ComponentType }>> = {
  "bay-area-q1-2026": () => import("@/app/blog/bay-area-q1-2026/page"),
  "la-real-estate-q1-2026": () => import("@/app/blog/la-real-estate-q1-2026/page"),
  "san-diego-deep-dive-2026": () => import("@/app/blog/san-diego-deep-dive-2026/page"),
  "bay-area-housing-eoy-2025": () => import("@/app/blog/bay-area-housing-eoy-2025/page"),
  "sf-office-market-2025": () => import("@/app/blog/sf-office-market-2025/page"),
  "san-diego-market-2025": () => import("@/app/blog/san-diego-market-2025/page"),
  "la-real-estate-market-2025": () => import("@/app/blog/la-real-estate-market-2025/page"),
  "cre-market-deep-dive-2025": () => import("@/app/blog/cre-market-deep-dive-2025/page"),
  "bay-area-real-estate-shift": () => import("@/app/blog/bay-area-real-estate-shift/page"),
  "real-state-housing-2025": () => import("@/app/blog/real-state-housing-2025/page"),
  "june-property-recap-12-deals": () => import("@/app/blog/june-property-recap-12-deals/page"),
  "big-beautiful-bill-tax-reform": () => import("@/app/blog/big-beautiful-bill-tax-reform/page"),
  "missouri-capital-gains-elimination": () => import("@/app/blog/missouri-capital-gains-elimination/page"),
};

function PostContent({ slug }: { slug: string }) {
  const [Content, setContent] = useState<ComponentType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loader = contentLoaders[slug];
    if (!loader) {
      setLoading(false);
      return;
    }
    loader()
      .then((mod) => {
        setContent(() => mod.default);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div style={{ padding: "48px 0", textAlign: "center" }}>
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#534AB7",
            margin: "0 auto",
            animation: "v2-blog-pulse 1s infinite",
          }}
        />
        <style>{`@keyframes v2-blog-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.75)} }`}</style>
      </div>
    );
  }

  if (!Content) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: "#4e4a6a", fontSize: 14 }}>
        Article content not available.
      </div>
    );
  }

  return (
    <>
      <style>{articleStyles}</style>
      <div className="v2-article">
        <Content />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <div style={{ background: "#0d0d14", minHeight: "100vh" }}>
        <NavBar />
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            padding: "120px 24px",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#f0eeff", marginBottom: 12 }}>
            Post not found
          </h1>
          <p style={{ fontSize: 14, color: "#4e4a6a", marginBottom: 24 }}>
            This blog post doesn&apos;t exist or has been moved.
          </p>
          <button
            onClick={() => router.push("/v2/blog")}
            style={{
              background: "#534AB7",
              color: "#f0eeff",
              border: "none",
              borderRadius: 9,
              padding: "10px 20px",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Back to blog
          </button>
        </div>
      </div>
    );
  }

  const relatedPosts = blogPosts
    .filter((p) => p.slug !== slug && p.category === post.category)
    .slice(0, 3);

  return (
    <div style={{ background: "#0d0d14", minHeight: "100vh" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(127,119,221,0.07) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <NavBar />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 760,
          margin: "0 auto",
          padding: "48px 24px 80px",
        }}
      >
        {/* Back link */}
        <div
          onClick={() => router.push("/v2/blog")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#534AB7",
            fontSize: 13,
            cursor: "pointer",
            marginBottom: 32,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M9 2L4 7l5 5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to blog
        </div>

        {/* Article header */}
        <div style={{ marginBottom: 32 }}>
          <span
            style={{
              display: "inline-block",
              background: "rgba(83,74,183,0.2)",
              border: "0.5px solid rgba(127,119,221,0.3)",
              borderRadius: 5,
              padding: "3px 10px",
              fontSize: 11,
              color: "#9994b8",
              marginBottom: 14,
            }}
          >
            {post.category}
          </span>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#f0eeff",
              letterSpacing: "-0.8px",
              lineHeight: 1.2,
              marginBottom: 14,
              marginTop: 0,
            }}
          >
            {post.title}
          </h1>
          <div
            style={{
              display: "flex",
              gap: 16,
              fontSize: 13,
              color: "#3a3758",
              marginBottom: 24,
            }}
          >
            <span>{post.date}</span>
            <span>{post.readTime}</span>
          </div>

          {/* Featured image */}
          <div
            style={{
              height: 0.5,
              background: "rgba(127,119,221,0.15)",
              marginBottom: 32,
            }}
          />
        </div>

        {/* Full article content — V1 component with V2 CSS overrides */}
        <PostContent slug={slug} />

        {/* Bottom CTA */}
        <div
          style={{
            marginTop: 64,
            padding: 28,
            background: "#13121d",
            border: "0.5px solid rgba(127,119,221,0.15)",
            borderRadius: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{ fontSize: 15, fontWeight: 600, color: "#e8e6f0", marginBottom: 4 }}
            >
              Analyze deals like these yourself.
            </div>
            <div style={{ fontSize: 13, color: "#4e4a6a" }}>
              Run any property through our AI analysis engine &mdash; free to start.
            </div>
          </div>
          <button
            onClick={() => router.push("/v2")}
            style={{
              background: "#534AB7",
              color: "#f0eeff",
              border: "none",
              borderRadius: 9,
              padding: "11px 22px",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              flexShrink: 0,
              fontFamily: "inherit",
            }}
          >
            Try it free &rarr;
          </button>
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <div
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "#3a3758",
                marginBottom: 16,
              }}
            >
              More from {post.category}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 12,
              }}
            >
              {relatedPosts.map((rp) => (
                <div
                  key={rp.slug}
                  onClick={() => router.push(`/v2/blog/${rp.slug}`)}
                  style={{
                    background: "#13121d",
                    border: "0.5px solid rgba(127,119,221,0.15)",
                    borderRadius: 12,
                    padding: "16px 18px",
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(127,119,221,0.4)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(127,119,221,0.15)")
                  }
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: "#534AB7",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: 6,
                    }}
                  >
                    {rp.category}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#e8e6f0",
                      lineHeight: 1.4,
                      marginBottom: 8,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical" as any,
                      overflow: "hidden",
                    }}
                  >
                    {rp.title}
                  </div>
                  <div style={{ fontSize: 11, color: "#3a3758" }}>{rp.readTime}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
