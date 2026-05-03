"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import NavBar from "@/components/v2/NavBar";
import Footer from "@/components/v2/Footer";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const strategyLabel = (s: string): string => {
  if (s === "rental" || s === "buy_hold" || s === "Buy & Hold") return "Buy & Hold";
  if (s === "flip" || s === "Fix & Flip") return "Fix & Flip";
  if (s === "brrrr" || s === "BRRRR") return "BRRRR";
  if (s === "house-hack" || s === "house_hack" || s === "House Hack") return "House Hack";
  return s || "\u2014";
};

const strategyColor = (s: string): string => {
  const l = strategyLabel(s);
  if (l === "Buy & Hold") return "#1D9E75";
  if (l === "Fix & Flip") return "#EF9F27";
  if (l === "BRRRR") return "#7F77DD";
  if (l === "House Hack") return "#534AB7";
  return "#6b6690";
};

const fmt$ = (n: number | null | undefined): string => {
  if (n == null) return "\u2014";
  const abs = Math.abs(Math.round(n));
  return `${n < 0 ? "-" : ""}$${abs.toLocaleString()}`;
};

const fmtPct = (n: number | null | undefined): string => {
  if (n == null) return "\u2014";
  return `${n.toFixed(1)}%`;
};

const fmtDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getDealScore = (a: any): number | null => {
  if (a.deal_score != null) return a.deal_score;
  if (a.dealScore != null) return a.dealScore;
  try {
    if (a.full_analysis) {
      const parsed = typeof a.full_analysis === "string" ? JSON.parse(a.full_analysis) : a.full_analysis;
      if (parsed.dealScore != null) return parsed.dealScore;
    }
  } catch {}
  if (a.analysis_data?.dealScore != null) return a.analysis_data.dealScore;
  if (a.analysis_data?.deal_score != null) return a.analysis_data.deal_score;
  if (a.analysis_data?.ai_analysis?.dealScore != null) return a.analysis_data.ai_analysis.dealScore;
  return null;
};

const scoreColor = (s: number | null) =>
  s == null ? "#3a3758" : s >= 7 ? "#1D9E75" : s >= 5 ? "#EF9F27" : "#f09595";

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function V2AnalysesPage() {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [strategyFilter, setStrategyFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "roi" | "score">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  /* ---------- Load ------------------------------------------------ */

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.push("/v2/login"); return; }

      try {
        const res = await fetch("/api/analysis/list?limit=100");
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.analyses || [];
          setAnalyses(list);
          setTotal(data.total || list.length);
        }
      } catch (err) {
        console.error("Failed to load:", err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [router]);

  /* ---------- Group / filter / sort ------------------------------- */

  // Collapse Pro Max sibling rows into a single Max IQ entry per proMaxRunId.
  // Singles pass through unchanged.
  const groupedAnalyses = useMemo(() => {
    const groups = new Map<string, any[]>();
    const singles: any[] = [];

    for (const a of analyses) {
      const runId = a.analysis_data?.proMaxRunId;
      if (runId) {
        if (!groups.has(runId)) groups.set(runId, []);
        groups.get(runId)!.push(a);
      } else {
        singles.push(a);
      }
    }

    const proMaxEntries = Array.from(groups.values()).map((group) => ({
      ...group[0],
      isProMaxGroup: true,
      proMaxSiblings: group,
      displayLabel: "Max IQ Analysis",
    }));

    return [...proMaxEntries, ...singles].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [analyses]);

  const filteredAnalyses = useMemo(() => {
    let result = [...groupedAnalyses];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((a) => a.address?.toLowerCase().includes(q));
    }

    if (strategyFilter !== "all") {
      result = result.filter(
        (a) => a.strategy === strategyFilter || a.deal_type === strategyFilter
      );
    }

    result.sort((a, b) => {
      let aV: number, bV: number;
      if (sortBy === "date") {
        aV = new Date(a.created_at).getTime();
        bV = new Date(b.created_at).getTime();
      } else if (sortBy === "roi") {
        aV = a.roi ?? -999;
        bV = b.roi ?? -999;
      } else {
        aV = getDealScore(a) ?? -999;
        bV = getDealScore(b) ?? -999;
      }
      return sortDir === "desc" ? bV - aV : aV - bV;
    });

    return result;
  }, [groupedAnalyses, search, strategyFilter, sortBy, sortDir]);

  /* ---------- Selection ------------------------------------------- */

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredAnalyses.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAnalyses.map((a) => a.id)));
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/analysis/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      setTotal((prev) => prev - 1);
      const next = new Set(selectedIds);
      next.delete(id);
      setSelectedIds(next);
    }
    setDeletingId(null);
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    const ids = Array.from(selectedIds);
    await Promise.all(ids.map((id) => fetch(`/api/analysis/${id}`, { method: "DELETE" })));
    setAnalyses((prev) => prev.filter((a) => !selectedIds.has(a.id)));
    setTotal((prev) => prev - ids.length);
    setSelectedIds(new Set());
    setIsBulkDeleting(false);
  };

  /* ---------- Styles ---------------------------------------------- */

  const inputStyle: React.CSSProperties = {
    background: "#0d0d14",
    border: "0.5px solid rgba(127,119,221,0.2)",
    borderRadius: 8,
    padding: "9px 14px",
    color: "#e8e6f0",
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
  };

  const checkboxStyle = (checked: boolean): React.CSSProperties => ({
    width: 18,
    height: 18,
    borderRadius: 4,
    background: checked ? "#534AB7" : "#0d0d14",
    border: `0.5px solid ${checked ? "#534AB7" : "rgba(127,119,221,0.3)"}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  });

  /* ---------- Render ---------------------------------------------- */

  return (
    <div style={{ background: "#0d0d14", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "radial-gradient(circle, rgba(127,119,221,0.07) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
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
          .analyses-filter-bar {
            flex-direction: column !important;
          }
          .analyses-filter-bar input,
          .analyses-filter-bar select {
            width: 100% !important;
            min-width: unset !important;
          }
        }
      `}</style>

      <main className="page-main" style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto", padding: "48px 24px 80px", flex: 1 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="page-headline" style={{ fontSize: 28, fontWeight: 700, color: "#f0eeff", letterSpacing: "-0.8px", margin: 0 }}>Analysis History</h1>
            <p style={{ fontSize: 14, color: "#4e4a6a", marginTop: 4 }}>{total} properties analyzed</p>
          </div>
          <button onClick={() => router.push("/v2")} style={{ background: "#534AB7", color: "#f0eeff", padding: "9px 20px", borderRadius: 9, fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer", fontFamily: "inherit" }}>+ New Analysis</button>
        </div>

        {/* Filter bar */}
        <div className="analyses-filter-bar" style={{ background: "#13121d", border: "0.5px solid rgba(127,119,221,0.15)", borderRadius: 14, padding: "16px 20px", marginBottom: 16, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input type="text" placeholder="Search by address..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 200 }} onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(127,119,221,0.5)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(127,119,221,0.2)")} />
          <select value={strategyFilter} onChange={(e) => setStrategyFilter(e.target.value)} style={{ ...inputStyle, width: 160 }}>
            <option value="all">All strategies</option>
            <option value="rental">Buy &amp; Hold</option>
            <option value="flip">Fix &amp; Flip</option>
            <option value="brrrr">BRRRR</option>
            <option value="house-hack">House Hack</option>
          </select>
          <select
            value={`${sortBy}-${sortDir}`}
            onChange={(e) => {
              const [b, d] = e.target.value.split("-") as ["date" | "roi" | "score", "asc" | "desc"];
              setSortBy(b);
              setSortDir(d);
            }}
            style={{ ...inputStyle, width: 150 }}
          >
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="roi-desc">Highest ROI</option>
            <option value="score-desc">Best score</option>
          </select>
        </div>

        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div style={{ background: "rgba(83,74,183,0.12)", border: "0.5px solid rgba(127,119,221,0.3)", borderRadius: 12, padding: "12px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: "#c0baf0", fontWeight: 500 }}>{selectedIds.size} selected</span>
            {selectedIds.size >= 2 && selectedIds.size <= 3 && (
              <button onClick={() => { const ids = Array.from(selectedIds).slice(0, 3); router.push(`/analysis/compare?ids=${ids.join(",")}`); }} style={{ background: "rgba(83,74,183,0.2)", border: "0.5px solid rgba(127,119,221,0.4)", color: "#c0baf0", borderRadius: 8, padding: "7px 16px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Compare</button>
            )}
            <button onClick={handleBulkDelete} disabled={isBulkDeleting} style={{ background: "rgba(162,45,45,0.12)", border: "0.5px solid rgba(162,45,45,0.3)", color: "#f09595", borderRadius: 8, padding: "7px 16px", fontSize: 13, cursor: isBulkDeleting ? "not-allowed" : "pointer", opacity: isBulkDeleting ? 0.5 : 1, fontFamily: "inherit" }}>{isBulkDeleting ? "Deleting..." : "Delete selected"}</button>
            <button onClick={() => setSelectedIds(new Set())} style={{ background: "transparent", border: "none", color: "#4e4a6a", fontSize: 13, cursor: "pointer", padding: "7px 12px", fontFamily: "inherit" }}>Clear selection</button>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div>
            <style>{`@keyframes v2h-pulse { from{opacity:0.4} to{opacity:0.8} }`}</style>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{ height: 64, background: "rgba(127,119,221,0.04)", border: "0.5px solid rgba(127,119,221,0.08)", borderRadius: 10, marginBottom: 8, animation: "v2h-pulse 1.4s ease infinite alternate" }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredAnalyses.length === 0 && (
          <div style={{ textAlign: "center", padding: "64px 24px" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(127,119,221,0.25)" strokeWidth="1.5" style={{ marginBottom: 16 }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: "#4e4a6a", marginBottom: 6 }}>
              {analyses.length === 0 ? "No analyses yet" : "No results for your filters"}
            </h3>
            <p style={{ fontSize: 14, color: "#3a3758", marginBottom: 20 }}>
              {analyses.length === 0
                ? "You haven\u2019t analyzed any properties yet."
                : "No analyses match your current filters."}
            </p>
            <button
              onClick={() => {
                if (analyses.length === 0) router.push("/v2");
                else { setSearch(""); setStrategyFilter("all"); }
              }}
              style={{ background: "#534AB7", color: "#f0eeff", padding: "10px 22px", borderRadius: 9, fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer", fontFamily: "inherit" }}
            >
              {analyses.length === 0 ? "Analyze your first property \u2192" : "Clear filters"}
            </button>
          </div>
        )}

        {/* Table header */}
        {!isLoading && filteredAnalyses.length > 0 && (
          <>
            <div style={{ display: "flex", padding: "0 20px 10px", gap: 12, alignItems: "center", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.6px", color: "#3a3758" }}>
              <div style={checkboxStyle(selectedIds.size === filteredAnalyses.length && filteredAnalyses.length > 0)} onClick={toggleSelectAll}>
                {selectedIds.size === filteredAnalyses.length && filteredAnalyses.length > 0 && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )}
              </div>
              <span style={{ width: 90 }}>Strategy</span>
              <span style={{ flex: 1 }}>Property</span>
              <span style={{ width: 60, textAlign: "center" }}>Score</span>
              <span style={{ width: 70, textAlign: "right" }}>ROI</span>
              <span style={{ width: 90, textAlign: "right" }}>Cash Flow</span>
              <span style={{ width: 80, textAlign: "right" }}>Date</span>
              <span style={{ width: 72 }} />
            </div>

            {/* Analysis rows */}
            {filteredAnalyses.map((a) => {
              const score = getDealScore(a);
              const isSelected = selectedIds.has(a.id);
              const isExpanded = expandedId === a.id;
              const strat = a.strategy || a.deal_type || "";
              const isFlipLike = strat === "flip" || strat === "brrrr" || strat === "Fix & Flip" || strat === "BRRRR";
              const cfValue = isFlipLike ? a.profit : a.monthly_cash_flow;

              return (
                <div key={a.id} style={{ background: isSelected ? "#16152a" : "#13121d", border: `0.5px solid ${isSelected ? "rgba(127,119,221,0.5)" : "rgba(127,119,221,0.12)"}`, borderRadius: 12, marginBottom: 8, overflow: "hidden", transition: "border-color 0.15s" }}>
                  {/* Top row */}
                  <div onClick={() => setExpandedId(isExpanded ? null : a.id)} style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: 12, cursor: "pointer" }}>
                    <div style={checkboxStyle(isSelected)} onClick={(e) => { e.stopPropagation(); toggleSelect(a.id); }}>
                      {isSelected && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </div>
                    <span style={{ background: `${strategyColor(strat)}1F`, border: `0.5px solid ${strategyColor(strat)}59`, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 500, color: strategyColor(strat), flexShrink: 0, width: 90, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{strategyLabel(strat)}</span>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#e8e6f0", letterSpacing: "-0.2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{a.address}</span>
                      {a.isProMaxGroup && (
                        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", color: "#EF9F27", background: "rgba(239,159,39,0.1)", border: "0.5px solid rgba(239,159,39,0.3)", borderRadius: 5, padding: "2px 6px", flexShrink: 0 }}>
                          Max IQ
                        </span>
                      )}
                    </span>
                    <span style={{ width: 60, textAlign: "center", fontSize: 15, fontWeight: 700, color: scoreColor(score) }}>{score ?? "\u2014"}</span>
                    <span style={{ width: 70, textAlign: "right", fontSize: 13, color: "#7F77DD" }}>{fmtPct(a.roi)}</span>
                    <span style={{ width: 90, textAlign: "right", fontSize: 13, color: cfValue != null && cfValue >= 0 ? "#1D9E75" : "#f09595" }}>{fmt$(cfValue)}</span>
                    <span style={{ width: 80, textAlign: "right", fontSize: 12, color: "#3a3758" }}>{fmtDate(a.created_at)}</span>
                    <div style={{ width: 72, display: "flex", gap: 6, justifyContent: "flex-end" }} onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => {
                        if (a.isProMaxGroup && a.proMaxSiblings?.length > 0) {
                          const ids = a.proMaxSiblings.map((s: any) => s.id).join(",");
                          router.push(`/v2/analyze?address=${encodeURIComponent(a.address)}&ids=${ids}&promax=1`);
                        } else {
                          router.push(`/v2/analyze?address=${encodeURIComponent(a.address)}&id=${a.id}`);
                        }
                      }} style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(83,74,183,0.1)", border: "0.5px solid rgba(127,119,221,0.2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(83,74,183,0.2)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(83,74,183,0.1)")}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7F77DD" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      </button>
                      {deletingId === a.id ? (
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => handleDelete(a.id)} style={{ fontSize: 11, padding: "3px 8px", background: "rgba(162,45,45,0.15)", border: "0.5px solid rgba(162,45,45,0.3)", borderRadius: 5, color: "#f09595", cursor: "pointer", fontFamily: "inherit" }}>Yes</button>
                          <button onClick={() => setDeletingId(null)} style={{ fontSize: 11, padding: "3px 8px", background: "transparent", border: "0.5px solid rgba(127,119,221,0.15)", borderRadius: 5, color: "#4e4a6a", cursor: "pointer", fontFamily: "inherit" }}>No</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeletingId(a.id)} style={{ width: 30, height: 30, borderRadius: 6, background: "transparent", border: "0.5px solid rgba(127,119,221,0.12)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, color: "#3a3758" }} onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(162,45,45,0.1)"; e.currentTarget.style.color = "#f09595"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#3a3758"; }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded row */}
                  {isExpanded && (
                    <div style={{ background: "rgba(83,74,183,0.04)", borderTop: "0.5px solid rgba(127,119,221,0.1)", padding: "16px 20px 20px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
                        {[
                          a.purchase_price ? { label: "Purchase Price", value: fmt$(a.purchase_price), color: "#f0eeff" } : null,
                          !isFlipLike && a.monthly_rent ? { label: "Monthly Rent", value: fmt$(a.monthly_rent), color: "#1D9E75" } : null,
                          a.cap_rate ? { label: "Cap Rate", value: fmtPct(a.cap_rate), color: "#7F77DD" } : null,
                          a.cash_on_cash ? { label: "Cash-on-Cash", value: fmtPct(a.cash_on_cash), color: "#7F77DD" } : null,
                          !isFlipLike && a.monthly_cash_flow != null ? { label: "Mo. Cash Flow", value: fmt$(a.monthly_cash_flow), color: a.monthly_cash_flow >= 0 ? "#1D9E75" : "#f09595" } : null,
                          a.total_investment ? { label: "Total Investment", value: fmt$(a.total_investment), color: "#f0eeff" } : null,
                          a.roi != null ? { label: "ROI", value: fmtPct(a.roi), color: "#7F77DD" } : null,
                          isFlipLike && a.profit != null ? { label: "Net Profit", value: fmt$(a.profit), color: a.profit >= 0 ? "#1D9E75" : "#f09595" } : null,
                          isFlipLike && a.arv ? { label: "ARV", value: fmt$(a.arv), color: "#f0eeff" } : null,
                        ]
                          .filter(Boolean)
                          .map((m: any) => (
                            <div key={m.label} style={{ background: "#0d0d14", border: "0.5px solid rgba(127,119,221,0.1)", borderRadius: 8, padding: "10px 12px" }}>
                              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5px", color: "#3a3758", marginBottom: 4 }}>{m.label}</div>
                              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.3px", color: m.color }}>{m.value}</div>
                            </div>
                          ))}
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={() => router.push(`/v2/analyze?address=${encodeURIComponent(a.address)}`)} style={{ background: "#534AB7", color: "#f0eeff", padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer", fontFamily: "inherit" }}>Run new analysis &rarr;</button>
                        <button onClick={() => {
                          if (a.isProMaxGroup && a.proMaxSiblings?.length > 0) {
                            const ids = a.proMaxSiblings.map((s: any) => s.id).join(",");
                            router.push(`/v2/analyze?address=${encodeURIComponent(a.address)}&ids=${ids}&promax=1`);
                          } else {
                            router.push(`/v2/analyze?address=${encodeURIComponent(a.address)}&id=${a.id}`);
                          }
                        }} style={{ background: "transparent", border: "0.5px solid rgba(127,119,221,0.25)", color: "#9994b8", padding: "9px 18px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>View full analysis</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pagination note */}
            {analyses.length >= 100 && (
              <p style={{ fontSize: 12, color: "#3a3758", textAlign: "center", marginTop: 16 }}>
                Showing your 100 most recent analyses.
              </p>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
