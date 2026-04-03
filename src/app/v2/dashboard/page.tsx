"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import NavBar from "@/components/v2/NavBar";
import Footer from "@/components/v2/Footer";
import SearchBar from "@/components/v2/SearchBar";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const dealTypeLabel: Record<string, string> = {
  "Fix & Flip": "Fix & Flip",
  "Buy & Hold": "Buy & Hold",
  BRRRR: "BRRRR",
  "House Hack": "House Hack",
  rental: "Buy & Hold",
  flip: "Fix & Flip",
  brrrr: "BRRRR",
  "house-hack": "House Hack",
  house_hack: "House Hack",
};

const formatRelative = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getDealScore = (a: any): number | null =>
  a.analysis_data?.dealScore ??
  a.analysis_data?.deal_score ??
  a.analysis_data?.ai_analysis?.dealScore ??
  a.ai_analysis?.dealScore ??
  null;

const scoreColor = (s: number | null) =>
  s == null ? "#3a3758" : s >= 7 ? "#1D9E75" : s >= 5 ? "#EF9F27" : "#f09595";

/* ------------------------------------------------------------------ */
/*  Skeleton card                                                      */
/* ------------------------------------------------------------------ */

function SkeletonCard() {
  return (
    <div
      style={{
        background: "#13121d",
        border: "0.5px solid rgba(127,119,221,0.1)",
        borderRadius: 14,
        padding: "18px 20px",
        height: 140,
      }}
    >
      <div
        style={{
          width: "55%",
          height: 13,
          background: "rgba(127,119,221,0.08)",
          borderRadius: 4,
          marginBottom: 8,
          animation: "skeleton-pulse 1.4s ease infinite alternate",
        }}
      />
      <div
        style={{
          width: "35%",
          height: 11,
          background: "rgba(127,119,221,0.08)",
          borderRadius: 4,
          marginBottom: 18,
          animation: "skeleton-pulse 1.4s ease infinite alternate",
        }}
      />
      <div style={{ display: "flex", gap: 12 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 36,
              height: 36,
              background: "rgba(127,119,221,0.08)",
              borderRadius: 4,
              animation: "skeleton-pulse 1.4s ease infinite alternate",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Analysis history card                                              */
/* ------------------------------------------------------------------ */

function AnalysisHistoryCard({
  analysis,
  deletingId,
  setDeletingId,
  onToggleFavorite,
  onDelete,
  onClick,
}: {
  analysis: any;
  deletingId: string | null;
  setDeletingId: (id: string | null) => void;
  onToggleFavorite: (id: string, val: boolean) => void;
  onDelete: (id: string) => void;
  onClick: () => void;
}) {
  const parts = (analysis.address || "").split(",");
  const line1 = parts[0]?.trim() || "Unknown address";
  const line2 = parts.slice(1).join(",").trim();
  const dt = analysis.deal_type || analysis.strategy || "";
  const strategyLabel = dealTypeLabel[dt] || dt;

  const ds = getDealScore(analysis);
  const roi = analysis.roi || 0;
  const profit = analysis.profit || 0;
  const isFlipLike =
    dt === "Fix & Flip" || dt === "flip" || dt === "BRRRR" || dt === "brrrr";

  const iconBtn: React.CSSProperties = {
    width: 26,
    height: 26,
    borderRadius: 6,
    background: "transparent",
    border: "0.5px solid rgba(127,119,221,0.12)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    flexShrink: 0,
  };

  return (
    <div
      onClick={onClick}
      style={{
        background: "#13121d",
        border: "0.5px solid rgba(127,119,221,0.15)",
        borderRadius: 14,
        padding: "18px 20px",
        cursor: "pointer",
        position: "relative",
        transition: "border-color 0.2s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderColor = "rgba(127,119,221,0.4)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = "rgba(127,119,221,0.15)")
      }
    >
      {/* Top row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 14,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#e8e6f0",
              letterSpacing: "-0.2px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {line1}
          </div>
          {line2 && (
            <div style={{ fontSize: 11, color: "#4e4a6a", marginTop: 2 }}>
              {line2}
            </div>
          )}
        </div>
        <span
          style={{
            background: "rgba(83,74,183,0.2)",
            border: "0.5px solid rgba(127,119,221,0.3)",
            borderRadius: 5,
            padding: "3px 8px",
            fontSize: 10,
            color: "#9994b8",
            whiteSpace: "nowrap",
            marginLeft: 8,
            flexShrink: 0,
          }}
        >
          {strategyLabel}
        </span>
      </div>

      {/* Metrics row */}
      <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "-0.5px",
              color: scoreColor(ds),
            }}
          >
            {ds != null ? ds : "\u2014"}
          </div>
          <div
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "#3a3758",
              marginTop: 2,
            }}
          >
            Deal score
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#7F77DD",
              letterSpacing: "-0.5px",
            }}
          >
            {roi ? `${roi.toFixed(1)}%` : "\u2014"}
          </div>
          <div
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "#3a3758",
              marginTop: 2,
            }}
          >
            ROI
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: profit >= 0 ? "#1D9E75" : "#f09595",
              letterSpacing: "-0.5px",
            }}
          >
            {profit != null
              ? `${profit >= 0 ? "+" : "-"}$${Math.abs(profit).toLocaleString()}`
              : "\u2014"}
          </div>
          <div
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "#3a3758",
              marginTop: 2,
            }}
          >
            {isFlipLike ? "Net profit" : "Mo. cash flow"}
          </div>
        </div>
      </div>

      {/* Footer row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 11, color: "#3a3758" }}>
          {formatRelative(analysis.created_at || analysis.analysis_date)}
        </span>

        <div
          style={{ display: "flex", gap: 6 }}
          onClick={(e) => e.stopPropagation()}
        >
          {deletingId === analysis.id ? (
            <div style={{ display: "flex", gap: 4 }}>
              <button
                style={{
                  fontSize: 11,
                  padding: "3px 8px",
                  background: "rgba(162,45,45,0.15)",
                  border: "0.5px solid rgba(162,45,45,0.3)",
                  borderRadius: 5,
                  color: "#f09595",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(analysis.id);
                }}
              >
                Yes
              </button>
              <button
                style={{
                  fontSize: 11,
                  padding: "3px 8px",
                  background: "transparent",
                  border: "0.5px solid rgba(127,119,221,0.15)",
                  borderRadius: 5,
                  color: "#4e4a6a",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletingId(null);
                }}
              >
                No
              </button>
            </div>
          ) : (
            <>
              {/* Favorite */}
              <button
                style={iconBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(analysis.id, !analysis.is_favorite);
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(239,159,39,0.1)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill={analysis.is_favorite ? "#EF9F27" : "none"}
                  stroke={analysis.is_favorite ? "#EF9F27" : "#3a3758"}
                  strokeWidth="2"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>

              {/* Delete */}
              <button
                style={iconBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletingId(analysis.id);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(162,45,45,0.1)";
                  e.currentTarget.style.borderColor = "rgba(162,45,45,0.2)";
                  e.currentTarget.style.color = "#f09595";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor =
                    "rgba(127,119,221,0.12)";
                  e.currentTarget.style.color = "#3a3758";
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [firstName, setFirstName] = useState("");
  const [userTier, setUserTier] = useState<"free" | "pro" | "pro_max">("free");
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [greetingText, setGreetingText] = useState("Welcome back.");
  const [selectedModel, setSelectedModel] = useState<string>("speed");
  const router = useRouter();

  /* ---------- Init ------------------------------------------------ */

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/v2");
        return;
      }

      setUser(session.user);

      const name =
        session.user.user_metadata?.full_name?.split(" ")[0] ||
        session.user.email?.split("@")[0] ||
        "";
      setFirstName(name);

      const options = [
        `Ready to find your next deal${name ? ", " + name : ""}?`,
        `What's up${name ? ", " + name : ""}?`,
        `Welcome back${name ? ", " + name : ""}.`,
        `Let's analyze something${name ? ", " + name : ""}.`,
        `Good to see you${name ? ", " + name : ""}.`,
      ];
      setGreetingText(options[Math.floor(Math.random() * options.length)]);

      // Get tier
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("subscription_tier")
        .eq("id", session.user.id)
        .single();

      const tier = profile?.subscription_tier || "free";
      setUserTier(
        tier === "pro-plus" || tier === "pro_plus" || tier === "premium"
          ? "pro_max"
          : tier === "pro" || tier === "professional"
            ? "pro"
            : "free"
      );

      // Fetch recent analyses
      try {
        const res = await fetch("/api/analysis/list?limit=6");
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data)
            ? data
            : data.analyses || data.data || [];
          setRecentAnalyses(list);
          setTotalCount(
            Array.isArray(data) ? list.length : data.total || list.length
          );
        }
      } catch (err) {
        console.error("Failed to load analyses:", err);
      } finally {
        setIsLoadingAnalyses(false);
      }
    };

    init();
  }, [router]);

  /* ---------- Actions --------------------------------------------- */

  const toggleFavorite = async (id: string, newValue: boolean) => {
    setRecentAnalyses((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_favorite: newValue } : a))
    );

    const supabase = createClient();
    const { error } = await supabase
      .from("analyzed_properties")
      .update({ is_favorite: newValue })
      .eq("id", id);

    if (error) {
      setRecentAnalyses((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, is_favorite: !newValue } : a
        )
      );
    }
  };

  const deleteAnalysis = async (id: string) => {
    const res = await fetch(`/api/analysis/${id}`, { method: "DELETE" });
    if (res.ok) {
      setRecentAnalyses((prev) => prev.filter((a) => a.id !== id));
      setTotalCount((prev) => prev - 1);
    }
    setDeletingId(null);
  };

  /* ---------- Derived --------------------------------------------- */

  const scores = recentAnalyses
    .map((a) => getDealScore(a))
    .filter((s): s is number => s != null);
  const avgScore =
    scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) /
        10
      : null;
  const avgScoreColor = scoreColor(avgScore);

  const topDeal = recentAnalyses.reduce<any>((best, curr) => {
    const s = getDealScore(curr) ?? 0;
    const bs = best ? getDealScore(best) ?? 0 : -1;
    return s > bs ? curr : best;
  }, null);

  const subLine =
    recentAnalyses.length > 0
      ? `You've analyzed ${totalCount} ${totalCount === 1 ? "property" : "properties"}. Here's where you left off.`
      : "Enter an address below to run your first AI-powered deal analysis.";

  const tierPillText = (() => {
    const tierName =
      userTier === "pro_max" ? "Pro Max" : userTier === "pro" ? "Pro" : "Free";
    const modelName =
      selectedModel === "max"
        ? "Max IQ \u2014 3 models"
        : selectedModel === "balanced"
          ? "Balanced model"
          : "Speed model";
    const limit =
      userTier === "free" ? "Blurred results" : "Unlimited analyses";
    return `${tierName} \u00B7 ${modelName} \u00B7 ${limit}`;
  })();

  const tierDotColor =
    selectedModel === "max"
      ? "#EF9F27"
      : selectedModel === "balanced"
        ? "#7F77DD"
        : "#6b6690";

  /* ---------- Render ---------------------------------------------- */

  return (
    <div style={{ background: "#0d0d14", minHeight: "100vh" }}>
      <style>{`
        @keyframes skeleton-pulse {
          from { opacity: 0.4; }
          to { opacity: 0.8; }
        }
      `}</style>
      <style>{`
        @media (max-width: 768px) {
          .analyses-grid {
            grid-template-columns: 1fr !important;
          }
          .stats-row-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .dashboard-main {
            padding: 32px 16px 48px !important;
          }
          .dashboard-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .greeting-text {
            font-size: 28px !important;
          }
        }
      `}</style>

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
        className="dashboard-main"
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 860,
          margin: "0 auto",
          padding: "64px 24px 48px",
        }}
      >
        {/* Section 1 — Greeting */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <h1
            className="greeting-text"
            style={{
              fontSize: 38,
              fontWeight: 700,
              color: "#f0eeff",
              letterSpacing: "-1.2px",
              lineHeight: 1.1,
              marginBottom: 10,
              marginTop: 0,
            }}
          >
            {greetingText}
          </h1>
          <p style={{ fontSize: 15, color: "#4e4a6a", margin: 0 }}>
            {subLine}
          </p>

          {/* Usage pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginTop: 14,
              background: "rgba(83,74,183,0.12)",
              border: "0.5px solid rgba(127,119,221,0.2)",
              borderRadius: 20,
              padding: "5px 14px",
              fontSize: 12,
              color: "#4e4a6a",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: tierDotColor,
                flexShrink: 0,
              }}
            />
            {tierPillText}
          </div>
        </div>

        {/* Section 2 — Search bar */}
        <div style={{ marginBottom: 52 }}>
          <span
            style={{
              display: "block",
              textAlign: "center",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: "#3a3758",
              marginBottom: 10,
            }}
          >
            Analyze a property
          </span>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <SearchBar
              userTier={userTier as any}
              onModelChange={(m) => setSelectedModel(m)}
            />
          </div>
        </div>

        {/* Section 3 — Recent analyses */}
        {isLoadingAnalyses && (
          <div>
            <div
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "#3a3758",
                marginBottom: 16,
              }}
            >
              Recent analyses
            </div>
            <div
              className="analyses-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 12,
              }}
            >
              {[0, 1, 2].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        )}

        {!isLoadingAnalyses && recentAnalyses.length > 0 && (
          <>
            <div
              className="dashboard-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "#3a3758",
                }}
              >
                Recent analyses
              </span>
              <span
                style={{ fontSize: 13, color: "#534AB7", cursor: "pointer" }}
                onClick={() => router.push("/v2/analyses")}
              >
                View all &rarr;
              </span>
            </div>

            <div
              className="analyses-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 12,
                marginBottom: 28,
              }}
            >
              {recentAnalyses.map((a) => (
                <AnalysisHistoryCard
                  key={a.id}
                  analysis={a}
                  deletingId={deletingId}
                  setDeletingId={setDeletingId}
                  onToggleFavorite={toggleFavorite}
                  onDelete={deleteAnalysis}
                  onClick={() =>
                    router.push(
                      `/v2/analyze?address=${encodeURIComponent(a.address)}&id=${a.id}`
                    )
                  }
                />
              ))}
            </div>

            {/* Section 4 — Stats */}
            <div
              className="stats-row-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 12,
              }}
            >
              <div
                style={{
                  background: "#13121d",
                  border: "0.5px solid rgba(127,119,221,0.1)",
                  borderRadius: 10,
                  padding: "16px 18px",
                }}
              >
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#f0eeff",
                    letterSpacing: "-0.5px",
                  }}
                >
                  {totalCount}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "#3a3758",
                    marginTop: 4,
                  }}
                >
                  Properties analyzed
                </div>
              </div>

              <div
                style={{
                  background: "#13121d",
                  border: "0.5px solid rgba(127,119,221,0.1)",
                  borderRadius: 10,
                  padding: "16px 18px",
                }}
              >
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: avgScoreColor,
                    letterSpacing: "-0.5px",
                  }}
                >
                  {avgScore != null ? avgScore : "\u2014"}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "#3a3758",
                    marginTop: 4,
                  }}
                >
                  Avg deal score
                </div>
              </div>

              <div
                style={{
                  background: "#13121d",
                  border: "0.5px solid rgba(127,119,221,0.1)",
                  borderRadius: 10,
                  padding: "16px 18px",
                }}
              >
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#1D9E75",
                    letterSpacing: "-0.5px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {topDeal ? topDeal.address.split(",")[0]?.trim() : "\u2014"}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "#3a3758",
                    marginTop: 4,
                  }}
                >
                  Top rated deal
                </div>
              </div>
            </div>
          </>
        )}

        {/* Section 5 — Empty state */}
        {!isLoadingAnalyses && recentAnalyses.length === 0 && (
          <div
            style={{
              marginTop: 48,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(127,119,221,0.25)"
              strokeWidth="1.5"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <p
              style={{
                fontSize: 17,
                fontWeight: 600,
                color: "#4e4a6a",
                marginTop: 14,
              }}
            >
              No analyses yet
            </p>
            <p
              style={{
                fontSize: 14,
                color: "#3a3758",
                marginTop: 6,
                lineHeight: 1.6,
              }}
            >
              Enter a property address above to run your first AI-powered deal
              analysis.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
