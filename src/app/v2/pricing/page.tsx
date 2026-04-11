"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import NavBar from "@/components/v2/NavBar";
import Footer from "@/components/v2/Footer";

/* ------------------------------------------------------------------ */
/*  Shared styles                                                      */
/* ------------------------------------------------------------------ */

const check = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1D9E75"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const dash = <span style={{ color: "#3a3758", fontSize: 14 }}>&mdash;</span>;

const featureRow = (
  icon: React.ReactNode,
  text: string,
  badge?: string,
  locked?: boolean
) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 10,
      padding: "6px 0",
    }}
  >
    <span style={{ flexShrink: 0, marginTop: 1 }}>{icon}</span>
    <span style={{ fontSize: 13, color: locked ? "#3a3758" : "#9994b8" }}>
      {text}
      {badge && (
        <span
          style={{
            background:
              badge === "Blurred"
                ? "rgba(127,119,221,0.1)"
                : "rgba(83,74,183,0.25)",
            color: badge === "Blurred" ? "#4e4a6a" : "#9994b8",
            borderRadius: 4,
            padding: "1px 7px",
            fontSize: 10,
            marginLeft: 6,
            verticalAlign: "middle",
          }}
        >
          {badge}
        </span>
      )}
    </span>
  </div>
);

/* ------------------------------------------------------------------ */
/*  FAQ data                                                           */
/* ------------------------------------------------------------------ */

const faqs = [
  {
    q: "What is \u2018Auto\u2019 model routing?",
    a: "On the Pro plan, we automatically select the best AI model for your investment strategy. BRRRR and Buy & Hold analyses run on Claude Sonnet for deep contextual reasoning. Fix & Flip and House Hack run on GPT-4.1 for clean financial prose. You get the right model every time without having to think about it.",
  },
  {
    q: "What makes Pro Max different from Pro?",
    a: "Pro Max runs your analysis through three AI models simultaneously \u2014 Claude Opus for deep risk analysis, GPT-4o for investor-grade narrative, and Grok 3 for quantitative modeling. You see all three results side-by-side and can compare how each model evaluates the same deal. It\u2019s the only way to get three independent AI opinions on a property in under 60 seconds.",
  },
  {
    q: "Can I switch plans anytime?",
    a: "Yes. You can upgrade, downgrade, or cancel at any time from your account settings. If you upgrade mid-cycle you\u2019ll be charged the prorated difference. If you downgrade, your current plan stays active until the end of the billing period.",
  },
  {
    q: "What happens to my analyses if I downgrade?",
    a: "Your saved analyses are always yours and never deleted. If you downgrade to Free, you\u2019ll still be able to view your analysis history \u2014 you just won\u2019t be able to run new analyses with the higher-tier models.",
  },
  {
    q: "Do you offer refunds?",
    a: "We offer a 7-day free trial on all paid plans so you can try the product before committing. Outside of that, we don\u2019t offer refunds on subscription charges. If you have an issue with your account, reach out at hello@dealsletter.io and we\u2019ll make it right.",
  },
  {
    q: "How accurate are the AI analyses?",
    a: "Our analyses are powered by real property data from RentCast \u2014 actual AVM values, rental comps, and market data. The AI models interpret this data and run the financial calculations. Accuracy depends heavily on the quality of available data for your specific market. Always verify key assumptions before making investment decisions. This is a powerful analysis tool, not a substitute for due diligence.",
  },
];

/* ------------------------------------------------------------------ */
/*  Comparison table data                                              */
/* ------------------------------------------------------------------ */

const tableRows = [
  { feature: "AI Model", free: "GPT-4o-mini", pro: "Claude Sonnet / GPT-4.1", max: "Opus + GPT-4o + Grok 3" },
  { feature: "Analyses per month", free: "3 / month", pro: "Unlimited", max: "Unlimited" },
  { feature: "All investment strategies", free: "check", pro: "check", max: "check" },
  { feature: "Full AI analysis", free: "Blurred", pro: "check", max: "check" },
  { feature: "PDF & Excel export", free: "dash", pro: "check", max: "check" },
  { feature: "Saved history", free: "dash", pro: "check", max: "check" },
  { feature: "Multi-model comparison", free: "dash", pro: "dash", max: "check" },
  { feature: "Parallel model execution", free: "dash", pro: "dash", max: "check" },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isSubscribing, setIsSubscribing] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/analysis/usage')
      .then(r => r.json())
      .then(data => {
        setUserTier(data.subscription_tier || null);
        setUserStatus(data.subscription_status || null);
      })
      .catch(() => {});
  }, []);

  const isCurrentPlan = (tierName: 'pro' | 'pro_max'): boolean => {
    if (userStatus !== 'active') return false;
    if (tierName === 'pro') {
      return userTier === 'pro' || userTier === 'professional';
    }
    if (tierName === 'pro_max') {
      return userTier === 'pro_plus' || userTier === 'pro-plus' || userTier === 'premium';
    }
    return false;
  };

  const handleSubscribe = async (tier: 'pro' | 'pro_max') => {
    setIsSubscribing(tier);

    // Check if user is logged in
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      // Store plan intent and send to signup
      localStorage.setItem("post_signup_plan", tier);
      localStorage.setItem("post_login_redirect", "/v2/pricing");
      router.push(`/v2/signup?plan=${tier}`);
      setIsSubscribing(null);
      return;
    }

    try {
      // First check if user has active subscription
      const usageRes = await fetch('/api/analysis/usage');
      if (usageRes.ok) {
        const usage = await usageRes.json();
        const currentTier = usage.subscription_tier || 'free';
        const isActive = usage.subscription_status === 'active';

        // If already subscribed to any paid plan, send to billing portal
        if (isActive && currentTier !== 'free' && currentTier !== null) {
          const portalRes = await fetch('/api/stripe/billing-portal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ returnPath: '/v2/pricing' })
          });
          if (portalRes.ok) {
            const { url } = await portalRes.json();
            window.location.href = url;
            return;
          }
        }
      }

      // Not subscribed — create new checkout session
      const res = await fetch('/api/v2/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          billingPeriod: isAnnual ? 'yearly' : 'monthly'
        })
      });

      if (!res.ok) {
        const err = await res.json();
        console.error('Checkout error:', err);
        setIsSubscribing(null);
        return;
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      setIsSubscribing(null);
    }
  }

  const proPrice = isAnnual ? "$290" : "$29";
  const proSub = isAnnual ? "per year" : "/month";
  const proBelow = isAnnual ? "$24/mo billed annually" : null;
  const proSave = isAnnual ? "Save $58 vs monthly billing" : null;

  const maxPrice = isAnnual ? "$790" : "$79";
  const maxSub = isAnnual ? "per year" : "/month";
  const maxBelow = isAnnual ? "$66/mo billed annually" : null;

  const cardBase: React.CSSProperties = {
    background: "#13121d",
    border: "0.5px solid rgba(127,119,221,0.15)",
    borderRadius: 16,
    padding: "28px 24px",
    display: "flex",
    flexDirection: "column",
  };

  const tierLabel: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: "#9994b8",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    marginBottom: 8,
  };

  const priceMain: React.CSSProperties = {
    fontSize: 42,
    fontWeight: 700,
    color: "#f0eeff",
    letterSpacing: "-1.5px",
    marginBottom: 4,
  };

  const ctaOutline: React.CSSProperties = {
    width: "100%",
    padding: 12,
    background: "transparent",
    border: "0.5px solid rgba(127,119,221,0.3)",
    borderRadius: 10,
    color: "#9994b8",
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
    marginBottom: 24,
  };

  const ctaFilled: React.CSSProperties = {
    width: "100%",
    padding: 12,
    background: "#534AB7",
    color: "#f0eeff",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    marginBottom: 8,
  };

  const cellValue = (val: string) => {
    if (val === "check") return check;
    if (val === "dash") return dash;
    return <span style={{ fontSize: 12, color: "#9994b8" }}>{val}</span>;
  };

  return (
    <div style={{ background: "#0d0d14", minHeight: "100vh" }}>
      {/* Dot grid */}
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

      <main
        className="pricing-main"
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 960,
          margin: "0 auto",
          padding: "72px 24px 80px",
        }}
      >
        <style>{`
          @media (max-width: 768px) {
            .pricing-grid {
              grid-template-columns: 1fr !important;
            }
            .pricing-table-grid {
              display: none !important;
            }
            .pricing-main {
              padding: 48px 16px 64px !important;
            }
            .pricing-headline {
              font-size: 28px !important;
            }
            .billing-toggle {
              flex-wrap: wrap !important;
              justify-content: center !important;
            }
          }
        `}</style>

        {/* SECTION 1 — Header */}
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              color: "#3C3489",
              marginBottom: 14,
            }}
          >
            Pricing
          </p>
          <h1
            className="pricing-headline"
            style={{
              fontSize: 42,
              fontWeight: 700,
              color: "#f0eeff",
              letterSpacing: "-1.2px",
              marginBottom: 12,
              marginTop: 0,
            }}
          >
            Simple pricing. Smarter AI as you grow.
          </h1>
          <p style={{ fontSize: 16, color: "#4e4a6a", marginBottom: 48 }}>
            Start free. Upgrade your AI when your deals demand it.
          </p>
        </div>

        {/* SECTION 2 — Billing toggle */}
        <div
          className="billing-toggle"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            marginBottom: 40,
          }}
        >
          <span
            style={{ fontSize: 14, color: isAnnual ? "#4e4a6a" : "#e8e6f0" }}
          >
            Monthly
          </span>
          <div
            onClick={() => setIsAnnual(!isAnnual)}
            style={{
              width: 44,
              height: 24,
              background: isAnnual
                ? "#534AB7"
                : "rgba(127,119,221,0.2)",
              borderRadius: 12,
              cursor: "pointer",
              position: "relative",
              transition: "background 0.2s",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                background: "#f0eeff",
                borderRadius: "50%",
                position: "absolute",
                top: 3,
                left: isAnnual ? 23 : 3,
                transition: "left 0.2s ease",
              }}
            />
          </div>
          <span
            style={{ fontSize: 14, color: isAnnual ? "#e8e6f0" : "#4e4a6a" }}
          >
            Annual
          </span>
          {isAnnual && (
            <span
              style={{
                background: "rgba(29,158,117,0.15)",
                border: "0.5px solid rgba(29,158,117,0.3)",
                borderRadius: 20,
                padding: "3px 12px",
                fontSize: 12,
                color: "#1D9E75",
                marginLeft: 6,
              }}
            >
              Save 2 months
            </span>
          )}
        </div>

        {/* SECTION 3 — Tier cards */}
        <div
          className="pricing-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginBottom: 64,
          }}
        >
          {/* Free */}
          <div style={cardBase}>
            <div style={tierLabel}>Free</div>
            <div style={priceMain}>$0</div>
            <div style={{ fontSize: 13, color: "#3a3758", marginBottom: 6 }}>
              no credit card required
            </div>
            <div
              style={{ fontSize: 12, color: "#534AB7", marginBottom: 20 }}
            >
              Speed model &mdash; GPT-4o mini
            </div>
            <button
              style={ctaOutline}
              onClick={() => router.push("/v2/signup")}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(127,119,221,0.6)";
                e.currentTarget.style.color = "#c0baf0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(127,119,221,0.3)";
                e.currentTarget.style.color = "#9994b8";
              }}
            >
              Get started free
            </button>
            <div
              style={{
                height: 0.5,
                background: "rgba(127,119,221,0.1)",
                marginBottom: 20,
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "6px 0",
              }}
            >
              <span style={{ flexShrink: 0, marginTop: 1 }}>{check}</span>
              <span style={{ fontSize: 13, color: "#9994b8" }}>
                3 analyses per month
                <div style={{ fontSize: 11, color: "#4e4a6a", marginTop: 2 }}>
                  Resets on the 1st of each month
                </div>
              </span>
            </div>
            {featureRow(check, "All 4 investment strategies")}
            {featureRow(check, "Live market data & comps")}
            {featureRow(check, "Key financial metrics")}
            {featureRow(check, "Risk flags")}
            {featureRow(dash, "AI narrative & deep analysis", "Blurred", true)}
            {featureRow(dash, "PDF & Excel export", undefined, true)}
            {featureRow(dash, "Saved analysis history", undefined, true)}
            {featureRow(dash, "Multi-model comparison", undefined, true)}
          </div>

          {/* Pro */}
          <div
            style={{
              ...cardBase,
              background: "#191728",
              border: "1.5px solid rgba(127,119,221,0.6)",
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: -12,
                left: "50%",
                transform: "translateX(-50%)",
                background: "#534AB7",
                color: "#f0eeff",
                borderRadius: 20,
                padding: "4px 16px",
                fontSize: 12,
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              Most popular
            </span>
            <div style={tierLabel}>Pro</div>
            <div style={priceMain}>{proPrice}</div>
            <div style={{ fontSize: 13, color: "#3a3758", marginBottom: 6 }}>
              {proSub}
            </div>
            {!isAnnual && (
              <div style={{ fontSize: 12, color: "#1D9E75", marginTop: 4, marginBottom: 6 }}>
                7-day free trial &mdash; cancel anytime
              </div>
            )}
            {proBelow && (
              <div
                style={{ fontSize: 12, color: "#1D9E75", marginBottom: 6 }}
              >
                {proBelow}
              </div>
            )}
            <div
              style={{ fontSize: 12, color: "#534AB7", marginBottom: 20 }}
            >
              Balanced model &mdash; Claude Sonnet &amp; GPT-4.1
            </div>
            {isCurrentPlan('pro') ? (
              <div style={{
                width: '100%',
                padding: '12px',
                textAlign: 'center',
                fontSize: 13,
                color: '#1D9E75',
                background: 'rgba(29,158,117,0.08)',
                border: '0.5px solid rgba(29,158,117,0.2)',
                borderRadius: 10,
                marginBottom: 8,
              }}>
                &#10003; Your current plan
              </div>
            ) : (
              <button
                style={{ ...ctaFilled, opacity: isSubscribing ? 0.7 : 1 }}
                disabled={isSubscribing !== null}
                onClick={() => handleSubscribe('pro')}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#6258cc")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#534AB7")
                }
              >
                {isSubscribing === 'pro' ? 'Redirecting...' : 'Start 7-day free trial \u2192'}
              </button>
            )}
            {proSave && (
              <div
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: "#1D9E75",
                  marginBottom: 16,
                }}
              >
                {proSave}
              </div>
            )}
            <div
              style={{
                height: 0.5,
                background: "rgba(127,119,221,0.1)",
                marginBottom: 20,
              }}
            />
            {featureRow(check, "Unlimited analyses")}
            {featureRow(check, "All 4 investment strategies")}
            {featureRow(check, "Full AI analysis \u2014 no blur")}
            {featureRow(check, "Auto model routing by strategy")}
            {featureRow(check, "PDF & Excel export")}
            {featureRow(check, "Saved analysis history")}
            {featureRow(dash, "Multi-model comparison", undefined, true)}
            {featureRow(dash, "Max IQ model access", undefined, true)}
          </div>

          {/* Pro Max */}
          <div style={cardBase}>
            <div style={tierLabel}>Pro Max</div>
            <div style={priceMain}>{maxPrice}</div>
            <div style={{ fontSize: 13, color: "#3a3758", marginBottom: 6 }}>
              {maxSub}
            </div>
            {!isAnnual && (
              <div style={{ fontSize: 12, color: "#1D9E75", marginTop: 4, marginBottom: 6 }}>
                7-day free trial &mdash; cancel anytime
              </div>
            )}
            {maxBelow && (
              <div
                style={{ fontSize: 12, color: "#1D9E75", marginBottom: 6 }}
              >
                {maxBelow}
              </div>
            )}
            <div
              style={{ fontSize: 12, color: "#534AB7", marginBottom: 20 }}
            >
              Max IQ &mdash; Claude Opus &middot; GPT-4o &middot; Grok 3
            </div>
            {isCurrentPlan('pro_max') ? (
              <div style={{
                width: '100%',
                padding: '12px',
                textAlign: 'center',
                fontSize: 13,
                color: '#1D9E75',
                background: 'rgba(29,158,117,0.08)',
                border: '0.5px solid rgba(29,158,117,0.2)',
                borderRadius: 10,
                marginBottom: 8,
              }}>
                &#10003; Your current plan
              </div>
            ) : (
              <button
                style={{ ...ctaFilled, opacity: isSubscribing ? 0.7 : 1 }}
                disabled={isSubscribing !== null}
                onClick={() => handleSubscribe('pro_max')}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#6258cc")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#534AB7")
                }
              >
                {isSubscribing === 'pro_max' ? 'Redirecting...' : 'Start 7-day free trial \u2192'}
              </button>
            )}
            <div style={{ height: 8 }} />
            <div
              style={{
                height: 0.5,
                background: "rgba(127,119,221,0.1)",
                marginBottom: 20,
              }}
            />
            {featureRow(check, "Everything in Pro")}
            {featureRow(check, "Max IQ model \u2014 Claude Opus 4.6")}
            {featureRow(check, "GPT-4o + Grok 3 access")}
            {featureRow(check, "Run all 3 models simultaneously")}
            {featureRow(check, "Side-by-side model comparison", "Exclusive")}
            {featureRow(check, "Earliest access to new features")}
          </div>
        </div>

        {/* SECTION 4 — Comparison table */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#f0eeff",
              letterSpacing: "-0.5px",
              marginBottom: 8,
            }}
          >
            Which AI model is right for you?
          </h2>
          <p style={{ fontSize: 14, color: "#4e4a6a", marginBottom: 32 }}>
            Every plan includes all 4 strategies. Your tier determines which AI
            model powers your analysis.
          </p>

          <div
            className="pricing-table-grid"
            style={{
              background: "#13121d",
              border: "0.5px solid rgba(127,119,221,0.15)",
              borderRadius: 16,
              overflow: "hidden",
              textAlign: "left",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr",
                padding: "14px 24px",
                background: "rgba(127,119,221,0.06)",
                borderBottom: "0.5px solid rgba(127,119,221,0.1)",
              }}
            >
              <span />
              {["Free", "Pro", "Pro Max"].map((h) => (
                <span
                  key={h}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#9994b8",
                    textAlign: "center",
                  }}
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {tableRows.map((row, i) => (
              <div
                key={row.feature}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr",
                  padding: "14px 24px",
                  alignItems: "center",
                  borderBottom:
                    i < tableRows.length - 1
                      ? "0.5px solid rgba(127,119,221,0.06)"
                      : "none",
                }}
              >
                <span style={{ fontSize: 13, color: "#9994b8" }}>
                  {row.feature}
                </span>
                <span style={{ textAlign: "center" }}>
                  {cellValue(row.free)}
                </span>
                <span style={{ textAlign: "center" }}>
                  {cellValue(row.pro)}
                </span>
                <span style={{ textAlign: "center" }}>
                  {cellValue(row.max)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 5 — FAQ */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#f0eeff",
              marginBottom: 32,
            }}
          >
            Frequently asked questions
          </h2>

          <div style={{ textAlign: "left" }}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                style={{
                  background: "#13121d",
                  border: "0.5px solid rgba(127,119,221,0.15)",
                  borderRadius: 12,
                  marginBottom: 8,
                  overflow: "hidden",
                }}
              >
                <div
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "18px 20px",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{ fontSize: 14, fontWeight: 500, color: "#e8e6f0" }}
                  >
                    {faq.q}
                  </span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    style={{
                      flexShrink: 0,
                      transform:
                        openFaq === i ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  >
                    <path
                      d="M3 5l4 4 4-4"
                      stroke="#4e4a6a"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                {openFaq === i && (
                  <div
                    style={{
                      padding: "0 20px 18px",
                      fontSize: 14,
                      color: "#6b6690",
                      lineHeight: 1.7,
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 6 — Bottom CTA */}
        <div
          style={{
            textAlign: "center",
            padding: 48,
            background: "rgba(83,74,183,0.06)",
            border: "0.5px solid rgba(127,119,221,0.15)",
            borderRadius: 20,
          }}
        >
          <h2
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#f0eeff",
              letterSpacing: "-0.5px",
              marginBottom: 8,
              marginTop: 0,
            }}
          >
            Start analyzing deals today.
          </h2>
          <p style={{ fontSize: 15, color: "#4e4a6a", marginBottom: 28 }}>
            Free plan includes 3 analyses/month &mdash; no card required.
            7-day free trial on paid plans. Cancel anytime.
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <button
              style={{
                background: "#534AB7",
                color: "#f0eeff",
                padding: "13px 32px",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 500,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
              onClick={() => router.push("/v2/signup")}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#6258cc")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#534AB7")
              }
            >
              Start for free &rarr;
            </button>
            <button
              style={{
                background: "transparent",
                border: "0.5px solid rgba(127,119,221,0.3)",
                color: "#9994b8",
                borderRadius: 10,
                padding: "13px 32px",
                fontSize: 15,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
              onClick={() => router.push("/v2/analyze?demo=true")}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(127,119,221,0.5)";
                e.currentTarget.style.color = "#c0baf0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(127,119,221,0.3)";
                e.currentTarget.style.color = "#9994b8";
              }}
            >
              View sample analysis
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
