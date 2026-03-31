"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import NavBar from "@/components/v2/NavBar";
import Footer from "@/components/v2/Footer";

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

const CANCEL_REASONS = [
  "Too expensive",
  "Not using it enough",
  "Missing a feature I need",
  "Just taking a break",
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function V2AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [usageInfo, setUsageInfo] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingBilling, setIsLoadingBilling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCancelFeedback, setShowCancelFeedback] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

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
        const res = await fetch("/api/analysis/usage");
        if (res.ok) setUsageInfo(await res.json());
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
      const res = await fetch(
        "/api/stripe/billing-portal?returnPath=/v2/account",
        { method: "POST" }
      );
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      }
    } catch (err) {
      console.error("Billing portal error:", err);
    } finally {
      setIsLoadingBilling(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    setCancelError("");
    try {
      const res = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
      });
      if (res.ok) {
        setShowCancelConfirm(false);
        setShowCancelFeedback(true);
      } else {
        setCancelError(
          "Cancellation failed. Please try again or contact support."
        );
      }
    } catch {
      setCancelError("Something went wrong. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCancelFeedback = async () => {
    try {
      if (cancelReason) {
        await fetch("/api/subscription/cancel-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: cancelReason }),
        });
      }
    } catch {}
    setShowCancelFeedback(false);
    setCancelReason("");
    const res = await fetch("/api/analysis/usage");
    if (res.ok) setUsageInfo(await res.json());
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
  const limit = usageInfo?.tier_limit || 0;
  const remaining = usageInfo?.remaining || 0;
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "User";

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

      <main
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
                  {user.user_metadata?.full_name || firstName}
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
                      ? `Trial ends ${formatDate(usageInfo?.trial_end)}`
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
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      style={{
                        background: "transparent",
                        border: "0.5px solid rgba(162,45,45,0.2)",
                        color: "#6b6690",
                        padding: "10px 20px",
                        borderRadius: 9,
                        fontSize: 13,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#f09595")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6690")}
                    >
                      Cancel subscription
                    </button>
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
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 16,
                  marginBottom: limit > 0 && !isAdmin ? 16 : 0,
                }}
              >
                <div style={cellStyle}>
                  <div style={cellLabel}>Analyses run</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#f0eeff" }}>
                    {used}
                  </div>
                </div>
                <div style={cellStyle}>
                  <div style={cellLabel}>Monthly limit</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#f0eeff" }}>
                    {isAdmin || limit >= 9999 ? "Unlimited" : limit}
                  </div>
                </div>
                <div style={cellStyle}>
                  <div style={cellLabel}>Remaining</div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color:
                        isAdmin || limit >= 9999
                          ? "#1D9E75"
                          : pct < 60
                            ? "#1D9E75"
                            : pct < 80
                              ? "#EF9F27"
                              : "#f09595",
                    }}
                  >
                    {isAdmin || limit >= 9999 ? "\u221E" : remaining}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              {!isAdmin && limit > 0 && limit < 9999 && (
                <div style={{ marginTop: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                      fontSize: 12,
                      color: "#3a3758",
                    }}
                  >
                    <span>Monthly usage</span>
                    <span>
                      {used} / {limit} analyses
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      borderRadius: 3,
                      background: "rgba(127,119,221,0.1)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct.toFixed(1)}%`,
                        borderRadius: 3,
                        background:
                          pct < 60
                            ? "#1D9E75"
                            : pct < 80
                              ? "#EF9F27"
                              : "#f09595",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                  {remaining === 0 && !isPaid && (
                    <div
                      style={{
                        marginTop: 12,
                        background: "rgba(162,45,45,0.08)",
                        border: "0.5px solid rgba(162,45,45,0.2)",
                        borderRadius: 8,
                        padding: "10px 14px",
                        fontSize: 13,
                        color: "#f09595",
                      }}
                    >
                      You&apos;ve used all your analyses this month. Upgrade to
                      Pro for unlimited analyses.
                    </div>
                  )}
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

      {/* E — Cancel confirmation modal */}
      {showCancelConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(13,13,20,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              background: "#13121d",
              border: "0.5px solid rgba(162,45,45,0.3)",
              borderRadius: 20,
              padding: 32,
              maxWidth: 440,
              width: "100%",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#EF9F27"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ marginBottom: 12 }}
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#f0eeff",
                marginBottom: 8,
                marginTop: 0,
              }}
            >
              Cancel your subscription?
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#6b6690",
                lineHeight: 1.6,
                marginBottom: 20,
              }}
            >
              Your {tierName} plan stays active until{" "}
              {formatDate(usageInfo?.current_period_end)}. After that you&apos;ll
              move to the Free plan.
            </p>
            <div
              style={{ fontSize: 13, color: "#3a3758", marginBottom: 12 }}
            >
              You will lose access to:
            </div>
            {[
              "Full AI analysis \u2014 results will be blurred",
              "PDF & Excel export",
              "Saved analysis history",
              tierName === "Pro"
                ? "Balanced model (Claude Sonnet / GPT-4.1)"
                : "Max IQ model access",
              ...(tierName === "Pro Max"
                ? ["Multi-model comparison view"]
                : []),
            ].map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <span style={{ color: "#f09595", fontSize: 12, flexShrink: 0 }}>
                  &times;
                </span>
                <span style={{ fontSize: 13, color: "#6b6690" }}>{item}</span>
              </div>
            ))}

            {cancelError && (
              <div
                style={{
                  marginTop: 16,
                  background: "rgba(162,45,45,0.1)",
                  border: "0.5px solid rgba(162,45,45,0.3)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  color: "#f09595",
                  fontSize: 13,
                }}
              >
                {cancelError}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 20,
              }}
            >
              <button
                onClick={() => setShowCancelConfirm(false)}
                style={{
                  flex: 1,
                  background: "#534AB7",
                  color: "#f0eeff",
                  padding: 12,
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 500,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Keep my plan
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={isCancelling}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "0.5px solid rgba(162,45,45,0.3)",
                  color: "#f09595",
                  padding: 12,
                  borderRadius: 10,
                  fontSize: 14,
                  cursor: isCancelling ? "not-allowed" : "pointer",
                  opacity: isCancelling ? 0.5 : 1,
                  fontFamily: "inherit",
                }}
              >
                {isCancelling ? "Cancelling..." : "Cancel subscription"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* F — Cancel feedback modal */}
      {showCancelFeedback && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(13,13,20,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              background: "#13121d",
              border: "0.5px solid rgba(127,119,221,0.25)",
              borderRadius: 20,
              padding: 32,
              maxWidth: 440,
              width: "100%",
            }}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#f0eeff",
                marginBottom: 6,
                marginTop: 0,
              }}
            >
              Sorry to see you go.
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#6b6690",
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              Your plan stays active until the end of your billing period. Mind
              telling us why you&apos;re leaving? It helps us improve.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {CANCEL_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setCancelReason(reason)}
                  style={{
                    background:
                      cancelReason === reason
                        ? "rgba(83,74,183,0.2)"
                        : "rgba(83,74,183,0.08)",
                    border: `0.5px solid ${cancelReason === reason ? "rgba(127,119,221,0.5)" : "rgba(127,119,221,0.15)"}`,
                    borderRadius: 10,
                    padding: "14px 16px",
                    cursor: "pointer",
                    textAlign: "center",
                    fontSize: 13,
                    color:
                      cancelReason === reason ? "#c0baf0" : "#6b6690",
                    fontFamily: "inherit",
                  }}
                >
                  {reason}
                </button>
              ))}
            </div>
            <button
              onClick={handleCancelFeedback}
              style={{
                width: "100%",
                background: "#534AB7",
                color: "#f0eeff",
                padding: 12,
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 500,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Done
            </button>
            <div
              onClick={handleCancelFeedback}
              style={{
                fontSize: 12,
                color: "#3a3758",
                textAlign: "center",
                marginTop: 10,
                cursor: "pointer",
              }}
            >
              Skip
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
