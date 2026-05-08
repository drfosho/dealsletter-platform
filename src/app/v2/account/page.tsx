"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import NavBar from "@/components/v2/NavBar";
import Footer from "@/components/v2/Footer";
import { FREE_MONTHLY_ANALYSIS_LIMIT } from "@/lib/constants";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const getTierDisplayName = (tier: string): string => {
  if (tier === "pro-plus" || tier === "pro_plus" || tier === "premium")
    return "Pro Max";
  if (tier === "pro" || tier === "professional") return "Pro";
  return "Free";
};

const getTierColor = (tier: string): string => {
  const name = getTierDisplayName(tier);
  if (name === "Pro Max") return "#EF9F27";
  if (name === "Pro") return "#7F77DD";
  return "#6b6690";
};

const formatDate = (iso: string | null): string => {
  if (!iso) return "\u2014";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function V2AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [usageInfo, setUsageInfo] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingBilling, setIsLoadingBilling] = useState(false);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);

  /* ---------- Load data ------------------------------------------- */

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push("/v2/login");
        return;
      }

      setUser(session.user);

      try {
        const res = await fetch("/api/analysis/usage", {
          cache: 'no-store'
        });
        if (res.ok) setUsageInfo(await res.json());

        // Check cancel_at_period_end from user_profiles table
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("cancel_at_period_end, current_period_end")
          .eq("id", session.user.id)
          .single();

        setCancelAtPeriodEnd(profile?.cancel_at_period_end || false);
      } catch (err) {
        console.error("Failed to load usage:", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [router]);

  /* ---------- Actions --------------------------------------------- */

  const handleManageBilling = async () => {
    setIsLoadingBilling(true);
    try {
      const res = await fetch("/api/stripe/billing-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnPath: "/v2/account" }),
      });
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      }
    } catch (err) {
      console.error("Portal error:", err);
    } finally {
      setIsLoadingBilling(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/v2");
  };

  /* ---------- Derived --------------------------------------------- */

  const tier = usageInfo?.subscription_tier || "free";
  const tierName = getTierDisplayName(tier);
  const tierColor = getTierColor(tier);
  const isAdmin = usageInfo?.is_admin;
  const isPaid = tierName === "Pro" || tierName === "Pro Max";
  const isTrialing = usageInfo?.subscription_status === "trialing";
  const used = usageInfo?.analyses_used || 0;
  const analysesThisMonth = usageInfo?.analyses_this_month || 0;
  const monthlyRemaining: number | null =
    usageInfo?.monthly_remaining ?? null;
  const isFree = (usageInfo?.is_limited ?? tier === "free") && !isAdmin;
  const nextResetDate = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    1
  );
  const nextResetLabel = nextResetDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const throttleLabel = (() => {
    const t = usageInfo?.subscription_tier || 'free';
    if (t === 'pro_max' || t === 'pro_plus' || t === 'pro-plus') return '30/hr \u00b7 150/day';
    if (t === 'pro' || t === 'professional') return '20/hr \u00b7 100/day';
    return '5/hr \u00b7 20/day';
  })();

  const firstName =
    user?.user_metadata?.first_name ||
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "there";

  const modelLabel =
    tierName === "Pro Max"
      ? "Max IQ (3 models)"
      : tierName === "Pro"
        ? "Balanced (Auto-routed)"
        : "Speed (GPT-4o-mini)";

  /* ---------- Shared styles --------------------------------------- */

  const cardStyle: React.CSSProperties = {
    background: "#13121d",
    border: "0.5px solid rgba(127,119,221,0.15)",
    borderRadius: 16,
    padding: "24px 28px",
    marginBottom: 16,
  };

  const cellStyle: React.CSSProperties = {
    background: "rgba(83,74,183,0.06)",
    borderRadius: 10,
    padding: "14px 16px",
  };

  const cellLabel: React.CSSProperties = {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "#3a3758",
    marginBottom: 6,
  };

  /* ---------- Render ---------------------------------------------- */

  return (
    <div
      style={{
        background: "#0d0d14",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
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

      <style>{`
        @media (max-width: 768px) {
          .page-main {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
          .page-headline {
            font-size: 28px !important;
            letter-spacing: -0.5px !important;
          }
          .account-stats-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>

      <main
        className="page-main"
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 860,
          margin: "0 auto",
          padding: "48px 24px 80px",
          flex: 1,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <h1
            className="page-headline"
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#f0eeff",
              letterSpacing: "-0.8px",
              margin: 0,
            }}
          >
            My Account
          </h1>
          <button
            onClick={handleSignOut}
            style={{
              background: "transparent",
              border: "0.5px solid rgba(127,119,221,0.2)",
              borderRadius: 8,
              padding: "7px 16px",
              fontSize: 13,
              color: "#4e4a6a",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#9994b8")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#4e4a6a")}
          >
            Sign out
          </button>
        </div>

        {/* Loading skeleton */}
        {isLoadingData && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <style>{`@keyframes v2-acct-pulse { from{opacity:0.4} to{opacity:0.8} }`}</style>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  height: 120,
                  background: "rgba(127,119,221,0.06)",
                  borderRadius: 14,
                  animation: "v2-acct-pulse 1.4s ease infinite alternate",
                }}
              />
            ))}
          </div>
        )}

        {!isLoadingData && user && (
          <>
            {/* A — Profile */}
            <div
              style={{
                ...cardStyle,
                display: "flex",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background:
                    tierName === "Pro Max"
                      ? "linear-gradient(135deg, #EF9F27, #f09595)"
                      : tierName === "Pro"
                        ? "linear-gradient(135deg, #534AB7, #7F77DD)"
                        : "rgba(83,74,183,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#f0eeff",
                  flexShrink: 0,
                }}
              >
                {user.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 600,
                    color: "#f0eeff",
                    marginBottom: 3,
                  }}
                >
                  {firstName}
                </div>
                <div style={{ fontSize: 13, color: "#4e4a6a" }}>
                  {user.email}
                </div>
                <div style={{ fontSize: 12, color: "#3a3758", marginTop: 3 }}>
                  Member since {formatDate(user.created_at)}
                </div>
              </div>
              <span
                style={{
                  background: `${tierColor}20`,
                  border: `0.5px solid ${tierColor}66`,
                  borderRadius: 8,
                  padding: "5px 14px",
                  fontSize: 13,
                  fontWeight: 500,
                  color: tierColor,
                  flexShrink: 0,
                }}
              >
                {tierName}
              </span>
            </div>

            {/* B — Subscription */}
            <div style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <span
                  style={{ fontSize: 14, fontWeight: 600, color: "#e8e6f0" }}
                >
                  Subscription
                </span>
                <span
                  style={{
                    background: isTrialing
                      ? "rgba(239,159,39,0.12)"
                      : isPaid
                        ? "rgba(29,158,117,0.12)"
                        : "rgba(127,119,221,0.1)",
                    border: `0.5px solid ${isTrialing ? "rgba(239,159,39,0.3)" : isPaid ? "rgba(29,158,117,0.3)" : "rgba(127,119,221,0.2)"}`,
                    borderRadius: 6,
                    padding: "3px 10px",
                    fontSize: 12,
                    fontWeight: 500,
                    color: isTrialing
                      ? "#EF9F27"
                      : isPaid
                        ? "#1D9E75"
                        : "#6b6690",
                  }}
                >
                  {isAdmin ? "Admin" : isTrialing ? "Trial" : isPaid ? "Active" : "Free"}
                </span>
              </div>

              <div
                className="account-stats-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                <div style={cellStyle}>
                  <div style={cellLabel}>Plan</div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: tierColor,
                    }}
                  >
                    {tierName}
                  </div>
                </div>
                <div style={cellStyle}>
                  <div style={cellLabel}>Next billing</div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#e8e6f0",
                    }}
                  >
                    {isTrialing
                      ? `Trial ends ${formatDate(usageInfo?.current_period_end)}`
                      : isPaid
                        ? formatDate(usageInfo?.current_period_end)
                        : "No billing"}
                  </div>
                </div>
                <div style={cellStyle}>
                  <div style={cellLabel}>AI Model</div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#9994b8",
                    }}
                  >
                    {modelLabel}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {!isPaid && !isAdmin && (
                  <>
                    <button
                      onClick={() => router.push("/v2/pricing")}
                      style={{
                        background: "#534AB7",
                        color: "#f0eeff",
                        padding: "10px 20px",
                        borderRadius: 9,
                        fontSize: 13,
                        fontWeight: 500,
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Upgrade to Pro &rarr;
                    </button>
                    <button
                      onClick={() => router.push("/v2/pricing")}
                      style={{
                        background: "transparent",
                        border: "0.5px solid rgba(127,119,221,0.2)",
                        color: "#6b6690",
                        padding: "10px 20px",
                        borderRadius: 9,
                        fontSize: 13,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      View all plans
                    </button>
                  </>
                )}
                {isPaid && !isAdmin && (
                  <>
                    <button
                      onClick={handleManageBilling}
                      disabled={isLoadingBilling}
                      style={{
                        background: "#534AB7",
                        color: "#f0eeff",
                        padding: "10px 20px",
                        borderRadius: 9,
                        fontSize: 13,
                        fontWeight: 500,
                        border: "none",
                        cursor: isLoadingBilling ? "not-allowed" : "pointer",
                        opacity: isLoadingBilling ? 0.5 : 1,
                        fontFamily: "inherit",
                      }}
                    >
                      {isLoadingBilling ? "Opening portal..." : "Manage billing \u2192"}
                    </button>
                    {tierName === "Pro" && (
                      <button
                        onClick={() => router.push("/v2/pricing")}
                        style={{
                          background: "transparent",
                          border: "0.5px solid rgba(239,159,39,0.3)",
                          color: "#EF9F27",
                          padding: "10px 20px",
                          borderRadius: 9,
                          fontSize: 13,
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        Upgrade to Pro Max
                      </button>
                    )}
                    {cancelAtPeriodEnd ? (
                      <div style={{ width: "100%" }}>
                        <div style={{
                          background: "rgba(239,159,39,0.08)",
                          border: "0.5px solid rgba(239,159,39,0.25)",
                          borderRadius: 10,
                          padding: "12px 16px",
                          marginBottom: 10,
                          fontSize: 13,
                          color: "#EF9F27",
                          lineHeight: 1.5,
                        }}>
                          Your subscription will end on{" "}
                          {formatDate(usageInfo?.current_period_end)}.
                          You still have full access until then.
                        </div>
                        <button
                          onClick={handleManageBilling}
                          disabled={isLoadingBilling}
                          style={{
                            background: "rgba(29,158,117,0.12)",
                            border: "0.5px solid rgba(29,158,117,0.3)",
                            color: "#1D9E75",
                            borderRadius: 9,
                            padding: "10px 20px",
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          {isLoadingBilling ? "Opening..." : "Resume subscription \u2192"}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleManageBilling}
                        disabled={isLoadingBilling}
                        style={{
                          background: "transparent",
                          border: "0.5px solid rgba(127,119,221,0.15)",
                          color: "#6b6690",
                          borderRadius: 9,
                          padding: "10px 20px",
                          fontSize: 13,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#f09595";
                          e.currentTarget.style.borderColor = "rgba(162,45,45,0.2)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#6b6690";
                          e.currentTarget.style.borderColor = "rgba(127,119,221,0.15)";
                        }}
                      >
                        Cancel subscription &rarr;
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* C — Usage */}
            <div style={cardStyle}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#e8e6f0",
                  marginBottom: 20,
                }}
              >
                Usage this month
              </div>

              <div
                className="account-stats-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 16,
                }}
              >
                {isFree ? (
                  <>
                    <div style={cellStyle}>
                      <div style={cellLabel}>Used this month</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#f0eeff" }}>
                        {analysesThisMonth}
                      </div>
                      <div style={{ fontSize: 11, color: "#3a3758" }}>
                        of {FREE_MONTHLY_ANALYSIS_LIMIT} free analyses
                      </div>
                    </div>
                    <div style={cellStyle}>
                      <div style={cellLabel}>Remaining</div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color:
                            monthlyRemaining === 0
                              ? "#f09595"
                              : (monthlyRemaining ?? 0) <= 1
                                ? "#EF9F27"
                                : "#1D9E75",
                        }}
                      >
                        {monthlyRemaining ?? "—"}
                      </div>
                      <div style={{ fontSize: 11, color: "#3a3758" }}>
                        resets on the 1st
                      </div>
                    </div>
                    <div style={cellStyle}>
                      <div style={cellLabel}>Resets</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#9994b8" }}>
                        1st of month
                      </div>
                      <div style={{ fontSize: 11, color: "#3a3758" }}>
                        {nextResetLabel}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={cellStyle}>
                      <div style={cellLabel}>Analyses run</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#f0eeff" }}>
                        {used}
                      </div>
                      <div style={{ fontSize: 11, color: "#3a3758" }}>
                        all time
                      </div>
                    </div>
                    <div style={cellStyle}>
                      <div style={cellLabel}>This month</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#f0eeff" }}>
                        {analysesThisMonth}
                      </div>
                      <div style={{ fontSize: 11, color: "#3a3758" }}>
                        no monthly cap
                      </div>
                    </div>
                    <div style={cellStyle}>
                      <div style={cellLabel}>Limit</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#9994b8" }}>
                        Unlimited
                      </div>
                      <div style={{ fontSize: 11, color: "#3a3758" }}>
                        no caps on your plan
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Free-tier progress bar */}
              {isFree && (
                <div style={{ marginTop: 16, marginBottom: 8 }}>
                  <div
                    style={{
                      height: 4,
                      background: "rgba(127,119,221,0.1)",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.min(
                          100,
                          (analysesThisMonth / FREE_MONTHLY_ANALYSIS_LIMIT) * 100
                        )}%`,
                        background:
                          monthlyRemaining === 0
                            ? "#f09595"
                            : (monthlyRemaining ?? 0) <= 1
                              ? "#EF9F27"
                              : "#534AB7",
                        borderRadius: 4,
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 6,
                      fontSize: 11,
                      color: "#4e4a6a",
                    }}
                  >
                    <span>
                      {analysesThisMonth} of {FREE_MONTHLY_ANALYSIS_LIMIT} used
                    </span>
                    <span>Resets {nextResetLabel}</span>
                  </div>
                </div>
              )}

              {/* Info box */}
              <div
                style={{
                  background: "rgba(83,74,183,0.06)",
                  border: "0.5px solid rgba(127,119,221,0.12)",
                  borderRadius: 10,
                  padding: "14px 16px",
                  marginTop: 16,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7F77DD"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{ flexShrink: 0, marginTop: 1 }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span style={{ fontSize: 13, color: "#6b6690" }}>
                  {isFree ? (
                    <>
                      Free plan includes {FREE_MONTHLY_ANALYSIS_LIMIT} analyses per month.
                      Upgrade to Pro for unlimited analyses with full AI insights and no caps.
                    </>
                  ) : (
                    <>
                      Analyses are unlimited on your {tierName} plan. Rate limits apply to
                      prevent abuse &mdash; {throttleLabel} maximum.
                    </>
                  )}
                </span>
              </div>

              {/* Free-tier upgrade CTA */}
              {isFree && (
                <div style={{
                  marginTop: 16,
                  background: 'rgba(83,74,183,0.06)',
                  border: '0.5px solid rgba(127,119,221,0.2)',
                  borderRadius: 12,
                  padding: '20px',
                }}>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#f0eeff',
                    marginBottom: 6
                  }}>
                    Want unlimited analyses?
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: '#6b6690',
                    lineHeight: 1.6,
                    marginBottom: 14
                  }}>
                    Upgrade to Pro for unlimited
                    analyses, full AI insights,
                    saved history, and PDF exports.
                    Try free for 7 days.
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={() =>
                        router.push('/v2/pricing')
                      }
                      style={{
                        flex: 1,
                        minWidth: 140,
                        background: '#534AB7',
                        color: '#f0eeff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 16px',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit'
                      }}
                    >
                      See plans →
                    </button>
                    <button
                      onClick={() =>
                        router.push('/v2/pricing#pro-max')
                      }
                      style={{
                        flex: 1,
                        minWidth: 140,
                        background: 'transparent',
                        color: '#9994b8',
                        border: '0.5px solid rgba(127,119,221,0.2)',
                        borderRadius: 8,
                        padding: '10px 16px',
                        fontSize: 13,
                        cursor: 'pointer',
                        fontFamily: 'inherit'
                      }}
                    >
                      Compare all plans
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* D — Quick actions */}
            <div style={cardStyle}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#e8e6f0",
                  marginBottom: 16,
                }}
              >
                Quick actions
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                {[
                  {
                    title: "New Analysis",
                    sub: "Analyze a property",
                    href: "/v2",
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7F77DD" strokeWidth="2" strokeLinecap="round">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                      </svg>
                    ),
                  },
                  {
                    title: "Analysis History",
                    sub: "View past analyses",
                    href: "/v2/dashboard",
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7F77DD" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    ),
                  },
                  {
                    title: "Pricing & Plans",
                    sub: "Compare all tiers",
                    href: "/v2/pricing",
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7F77DD" strokeWidth="2" strokeLinecap="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                    ),
                  },
                  {
                    title: "Help & FAQ",
                    sub: "Common questions",
                    href: "/v2/faq",
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7F77DD" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    ),
                  },
                ].map((action) => (
                  <div
                    key={action.title}
                    onClick={() => router.push(action.href)}
                    style={{
                      background: "rgba(83,74,183,0.06)",
                      border: "0.5px solid rgba(127,119,221,0.12)",
                      borderRadius: 12,
                      padding: "16px 18px",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(83,74,183,0.1)";
                      e.currentTarget.style.borderColor = "rgba(127,119,221,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(83,74,183,0.06)";
                      e.currentTarget.style.borderColor = "rgba(127,119,221,0.12)";
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: "rgba(83,74,183,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {action.icon}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: "#e8e6f0",
                        }}
                      >
                        {action.title}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "#4e4a6a", marginTop: 2 }}
                      >
                        {action.sub}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />

    </div>
  );
}
