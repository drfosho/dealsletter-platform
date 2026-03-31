"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/v2/NavBar";
import Footer from "@/components/v2/Footer";

/* ------------------------------------------------------------------ */
/*  Types + data                                                       */
/* ------------------------------------------------------------------ */

type StrategyKey = "brrrr" | "fix_flip" | "buy_hold" | "house_hack";

const tabs: { key: StrategyKey; label: string }[] = [
  { key: "brrrr", label: "BRRRR" },
  { key: "fix_flip", label: "Fix & Flip" },
  { key: "buy_hold", label: "Buy & Hold" },
  { key: "house_hack", label: "House Hack" },
];

interface Metric {
  label: string;
  value: string;
  color: string;
}

interface Phase {
  label: string;
  color: string;
  items: string[];
}

interface AiFocus {
  text: string;
}

interface StrategyData {
  badgeIcon: React.ReactNode;
  badgeText: string;
  title: string;
  fullName: string;
  description: string;
  phases: Phase[];
  metrics: Metric[];
  aiFocus: AiFocus[];
  ctaText: string;
  ctaHref: string;
}

const recycleIcon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7F77DD" strokeWidth="2" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>;
const wrenchIcon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7F77DD" strokeWidth="2" strokeLinecap="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>;
const houseIcon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7F77DD" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const peopleIcon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7F77DD" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;

const strategies: Record<StrategyKey, StrategyData> = {
  brrrr: {
    badgeIcon: recycleIcon,
    badgeText: "Long-term wealth building",
    title: "BRRRR",
    fullName: "Buy \u00B7 Rehab \u00B7 Rent \u00B7 Refi \u00B7 Repeat",
    description: "The BRRRR strategy is the most powerful wealth-building play in real estate. You buy a distressed property, renovate it, rent it out, refinance to pull your capital back out, and repeat. Done right, you can build a rental portfolio with the same dollars recycled over and over.\n\nThe key is the refi \u2014 a DSCR loan at 75% of ARV needs to return enough capital to cover your acquisition and rehab costs. If the numbers work, you\u2019re building equity with someone else\u2019s money.",
    phases: [
      { label: "Phase 1 \u2014 Acquisition", color: "#534AB7", items: ["Hard money loan \u2014 10% down, 12% interest only", "Rehab funded up to 85% of ARV", "Holding period: 3-9 months typical"] },
      { label: "Phase 2 \u2014 Refinance", color: "#1D9E75", items: ["DSCR refi at 75% LTV of ARV", "Cash-out proceeds return your capital", "30-year fixed at ~8% \u2014 now a cash flow asset"] },
    ],
    metrics: [
      { label: "Total Cost Basis", value: "$285,000", color: "#f0eeff" },
      { label: "ARV Estimate", value: "$380,000", color: "#f0eeff" },
      { label: "Equity Capture", value: "$95,000", color: "#1D9E75" },
      { label: "Refi Proceeds", value: "$285,000", color: "#7F77DD" },
      { label: "Monthly Cash Flow", value: "+$380", color: "#1D9E75" },
      { label: "Cash-on-Cash", value: "8.4%", color: "#7F77DD" },
    ],
    aiFocus: [
      { text: "Is the ARV achievable based on comparable sales?" },
      { text: "Does the refi proceed cover the total cost basis?" },
      { text: "Will the stabilized rent support DSCR \u2265 1.25?" },
      { text: "What\u2019s the equity capture as a % of ARV?" },
    ],
    ctaText: "Analyze a BRRRR deal \u2192",
    ctaHref: "/v2?strategy=brrrr",
  },
  fix_flip: {
    badgeIcon: wrenchIcon,
    badgeText: "Active income strategy",
    title: "Fix & Flip",
    fullName: "Buy \u00B7 Renovate \u00B7 Sell \u00B7 Profit",
    description: "Fix and flip is real estate\u2019s most active income strategy. You buy below market, add value through renovation, and sell for a profit. The math is simple \u2014 the execution is where deals are won or lost.\n\nThe 70% rule is your first filter: never pay more than 70% of ARV minus rehab costs. Hard money lenders will fund up to 85% of ARV \u2014 that\u2019s your ceiling. Everything between 70% and 85% is where your risk tolerance lives.",
    phases: [
      { label: "The 70% Rule", color: "#EF9F27", items: ["Max offer = (ARV \u00D7 70%) \u2212 Rehab costs", "Conservative investor\u2019s target. Leaves margin for carrying costs, selling costs, and unexpected overruns."] },
      { label: "Hard Money Ceiling", color: "#534AB7", items: ["Max loan = ARV \u00D7 85%", "Absolute ceiling for most hard money lenders. Anything above requires additional equity from the borrower."] },
    ],
    metrics: [
      { label: "Purchase Price", value: "$340,000", color: "#f0eeff" },
      { label: "Rehab Budget", value: "$65,000", color: "#EF9F27" },
      { label: "ARV", value: "$495,000", color: "#f0eeff" },
      { label: "Total Cash In", value: "$98,500", color: "#f0eeff" },
      { label: "Net Profit", value: "$47,200", color: "#1D9E75" },
      { label: "ROI on Cash", value: "47.9%", color: "#7F77DD" },
    ],
    aiFocus: [
      { text: "Is the ARV supported by recent comp sales?" },
      { text: "Does the purchase price beat the 70% MAO?" },
      { text: "Is the rehab budget realistic for this scope?" },
      { text: "How does profit change if hold extends 3 months?" },
    ],
    ctaText: "Analyze a Fix & Flip \u2192",
    ctaHref: "/v2?strategy=flip",
  },
  buy_hold: {
    badgeIcon: houseIcon,
    badgeText: "Passive income strategy",
    title: "Buy & Hold",
    fullName: "Acquire \u00B7 Rent \u00B7 Appreciate \u00B7 Hold",
    description: "Buy and hold is the foundation of most real estate portfolios. You buy a property, rent it out, and collect monthly cash flow while the asset appreciates over time. The wealth builds in three ways \u2014 cash flow, loan paydown, and appreciation.\n\nThe cap rate is your starting point: it tells you what the property yields independent of financing. Cash-on-cash tells you what your actual dollars return. Both matter, but cash-on-cash is what pays your bills.",
    phases: [
      { label: "The Cap Rate Benchmark", color: "#1D9E75", items: ["Cap rate = NOI \u00F7 purchase price", "Target 5%+ in most markets. Below 5% means you\u2019re likely in a high-appreciation, low-yield market \u2014 know which game you\u2019re playing."] },
      { label: "Cash-on-Cash Return", color: "#7F77DD", items: ["CoC = annual cash flow \u00F7 cash invested", "8%+ is strong. 5-8% is acceptable in appreciating markets. Below 5% and you\u2019re betting on appreciation alone."] },
    ],
    metrics: [
      { label: "Monthly Rent", value: "$2,840", color: "#1D9E75" },
      { label: "Monthly Expenses", value: "$2,228", color: "#f09595" },
      { label: "Net Cash Flow", value: "+$612", color: "#1D9E75" },
      { label: "Cap Rate", value: "6.8%", color: "#7F77DD" },
      { label: "Cash-on-Cash", value: "9.2%", color: "#7F77DD" },
      { label: "5-Year ROI", value: "54%", color: "#f0eeff" },
    ],
    aiFocus: [
      { text: "Is the rent estimate supported by local comps?" },
      { text: "Does the cap rate exceed the cost of debt?" },
      { text: "What does cash flow look like with 10% vacancy?" },
      { text: "How does this property build wealth over 30 years?" },
    ],
    ctaText: "Analyze a Buy & Hold \u2192",
    ctaHref: "/v2?strategy=rental",
  },
  house_hack: {
    badgeIcon: peopleIcon,
    badgeText: "Live-in investment strategy",
    title: "House Hack",
    fullName: "Live \u00B7 Rent \u00B7 Offset \u00B7 Build",
    description: "House hacking is the most capital-efficient entry point in real estate investing. You buy a multi-unit property, live in one unit, and rent the others to offset \u2014 or even eliminate \u2014 your mortgage payment.\n\nWith FHA financing at 3.5% down, you can control a $500,000 asset with $17,500. The rental income reduces your effective monthly cost, you build equity on the full property value, and you\u2019re learning to be a landlord with built-in accountability.",
    phases: [
      { label: "The FHA Advantage", color: "#534AB7", items: ["3.5% down on owner-occupied multi-family.", "That\u2019s leverage most investors dream about. The catch: you have to live there for at least one year. Most investors consider that a feature, not a bug."] },
      { label: "The Effective Cost", color: "#1D9E75", items: ["Effective monthly cost = mortgage \u2212 rental income", "If your mortgage is $2,800 and rent covers $1,600, you\u2019re living in a $500K property for $1,200/month while building equity on the full value."] },
    ],
    metrics: [
      { label: "Monthly Mortgage", value: "$2,847", color: "#f09595" },
      { label: "Rental Income", value: "$1,800", color: "#1D9E75" },
      { label: "Net Monthly Cost", value: "$1,047", color: "#1D9E75" },
      { label: "Savings vs Renting", value: "$890/mo", color: "#1D9E75" },
      { label: "Down Payment", value: "$17,500", color: "#f0eeff" },
      { label: "First Year Equity", value: "$28,400", color: "#7F77DD" },
    ],
    aiFocus: [
      { text: "Is the rental income enough to cover the mortgage?" },
      { text: "How does FHA compare to conventional on total cost?" },
      { text: "What is the effective monthly cost in a worst-case vacancy scenario?" },
      { text: "What does this property return if you move out and rent all units in year 3?" },
    ],
    ctaText: "Analyze a House Hack \u2192",
    ctaHref: "/v2?strategy=house-hack",
  },
};

/* ------------------------------------------------------------------ */
/*  Comparison table                                                   */
/* ------------------------------------------------------------------ */

const compRows = [
  { feature: "Income type", brrrr: "Passive", flip: "Active", bh: "Passive", hh: "Hybrid" },
  { feature: "Time commitment", brrrr: "High (rehab)", flip: "Very High", bh: "Low", hh: "Medium" },
  { feature: "Min. down payment", brrrr: "10%", flip: "10%", bh: "20-25%", hh: "3.5% FHA" },
  { feature: "Capital recycling", brrrr: "\u2713 Yes", flip: "\u2014", bh: "\u2014", hh: "\u2014" },
  { feature: "Monthly cash flow", brrrr: "After refi", flip: "\u2014", bh: "\u2713 Yes", hh: "Reduced cost" },
  { feature: "Best for", brrrr: "Builders", flip: "Operators", bh: "Accumulators", hh: "First-timers" },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function StrategiesPage() {
  const [activeStrategy, setActiveStrategy] = useState<StrategyKey>("brrrr");
  const router = useRouter();
  const s = strategies[activeStrategy];

  return (
    <div style={{ background: "#0d0d14", minHeight: "100vh" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "radial-gradient(circle, rgba(127,119,221,0.07) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <NavBar />

      <main style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "72px 24px 80px" }}>
        {/* SECTION 1 — Header */}
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "1.5px", color: "#3C3489", marginBottom: 14 }}>Investment Strategies</p>
          <h1 style={{ fontSize: 42, fontWeight: 700, color: "#f0eeff", letterSpacing: "-1.2px", marginBottom: 12, marginTop: 0 }}>Every strategy. One platform.</h1>
          <p style={{ fontSize: 16, color: "#4e4a6a", maxWidth: 520, margin: "0 auto 56px", lineHeight: 1.6 }}>Dealsletter is built for how real estate investors actually think. Pick your playbook and get an analysis built specifically for it.</p>
        </div>

        {/* SECTION 2 — Tabs */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveStrategy(t.key)}
              style={{
                padding: "8px 20px",
                borderRadius: 20,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "inherit",
                background: activeStrategy === t.key ? "rgba(83,74,183,0.25)" : "transparent",
                border: `0.5px solid ${activeStrategy === t.key ? "rgba(127,119,221,0.5)" : "rgba(127,119,221,0.15)"}`,
                color: activeStrategy === t.key ? "#c0baf0" : "#4e4a6a",
              }}
              onMouseEnter={(e) => {
                if (activeStrategy !== t.key) {
                  e.currentTarget.style.borderColor = "rgba(127,119,221,0.3)";
                  e.currentTarget.style.color = "#9994b8";
                }
              }}
              onMouseLeave={(e) => {
                if (activeStrategy !== t.key) {
                  e.currentTarget.style.borderColor = "rgba(127,119,221,0.15)";
                  e.currentTarget.style.color = "#4e4a6a";
                }
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* SECTION 3 — Strategy detail panel */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start", marginBottom: 64 }}>
          {/* Left column */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(83,74,183,0.15)", border: "0.5px solid rgba(127,119,221,0.3)", borderRadius: 8, padding: "6px 14px", fontSize: 12, color: "#9994b8", marginBottom: 20 }}>
              {s.badgeIcon}
              {s.badgeText}
            </div>

            <h2 style={{ fontSize: 32, fontWeight: 700, color: "#f0eeff", letterSpacing: "-0.8px", marginBottom: 6, marginTop: 0 }}>{s.title}</h2>
            <p style={{ fontSize: 14, color: "#534AB7", marginBottom: 20 }}>{s.fullName}</p>
            <p style={{ fontSize: 14, color: "#6b6690", lineHeight: 1.8, marginBottom: 24, whiteSpace: "pre-line" }}>{s.description}</p>

            {s.phases.map((phase) => (
              <div key={phase.label} style={{ background: "#13121d", borderLeft: `2px solid ${phase.color}`, borderRadius: "0 8px 8px 0", padding: "14px 16px", marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#9994b8", marginBottom: 6 }}>{phase.label}</div>
                {phase.items.map((item, j) => (
                  <div key={j} style={{ fontSize: 13, color: "#4e4a6a", lineHeight: 1.7 }}>{"\u2022 " + item}</div>
                ))}
              </div>
            ))}
          </div>

          {/* Right column */}
          <div>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "1px", color: "#3a3758", marginBottom: 16 }}>Key metrics we analyze</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
              {s.metrics.map((m) => (
                <div key={m.label} style={{ background: "#13121d", border: "0.5px solid rgba(127,119,221,0.12)", borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", color: "#3a3758", marginBottom: 6 }}>{m.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.3px", color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "1px", color: "#3a3758", margin: "20px 0 12px" }}>What our AI looks for</div>

            {s.aiFocus.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "6px 0", borderBottom: i < s.aiFocus.length - 1 ? "0.5px solid rgba(127,119,221,0.06)" : "none" }}>
                <span style={{ color: "#534AB7", flexShrink: 0, fontSize: 14, marginTop: 1 }}>&rsaquo;</span>
                <span style={{ fontSize: 13, color: "#6b6690", lineHeight: 1.5 }}>{f.text}</span>
              </div>
            ))}

            <button
              onClick={() => router.push(s.ctaHref)}
              style={{ marginTop: 20, background: "#534AB7", color: "#f0eeff", padding: "11px 24px", borderRadius: 9, fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer", fontFamily: "inherit" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#6258cc")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#534AB7")}
            >
              {s.ctaText}
            </button>
          </div>
        </div>

        {/* SECTION 4 — Comparison table */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: "#f0eeff", marginBottom: 8 }}>Not sure which strategy fits?</h2>
          <p style={{ fontSize: 14, color: "#4e4a6a", marginBottom: 32 }}>Here&apos;s how the four strategies compare across the dimensions that matter most.</p>

          <div style={{ background: "#13121d", border: "0.5px solid rgba(127,119,221,0.15)", borderRadius: 16, overflow: "hidden", textAlign: "left" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", padding: "14px 24px", background: "rgba(127,119,221,0.06)", borderBottom: "0.5px solid rgba(127,119,221,0.1)" }}>
              <span />
              {["BRRRR", "Fix & Flip", "Buy & Hold", "House Hack"].map((h) => (
                <span key={h} style={{ fontSize: 12, fontWeight: 600, color: "#9994b8", textAlign: "center" }}>{h}</span>
              ))}
            </div>
            {compRows.map((row, i) => (
              <div key={row.feature} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", padding: "14px 24px", alignItems: "center", borderBottom: i < compRows.length - 1 ? "0.5px solid rgba(127,119,221,0.06)" : "none" }}>
                <span style={{ fontSize: 13, color: "#9994b8" }}>{row.feature}</span>
                {[row.brrrr, row.flip, row.bh, row.hh].map((val, j) => (
                  <span key={j} style={{ fontSize: 12, textAlign: "center", color: val.includes("\u2713") ? "#1D9E75" : "#6b6690" }}>{val}</span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 5 — Bottom CTA */}
        <div style={{ textAlign: "center", padding: 48, background: "rgba(83,74,183,0.06)", border: "0.5px solid rgba(127,119,221,0.15)", borderRadius: 20 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: "#f0eeff", letterSpacing: "-0.5px", marginBottom: 8, marginTop: 0 }}>Run your first analysis free.</h2>
          <p style={{ fontSize: 15, color: "#4e4a6a", marginBottom: 28 }}>No account needed. Any address. Any strategy.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <button onClick={() => router.push("/v2")} style={{ background: "#534AB7", color: "#f0eeff", padding: "13px 32px", borderRadius: 10, fontSize: 15, fontWeight: 500, border: "none", cursor: "pointer", fontFamily: "inherit" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#6258cc")} onMouseLeave={(e) => (e.currentTarget.style.background = "#534AB7")}>Start analyzing &rarr;</button>
            <button onClick={() => router.push("/v2/how-it-works")} style={{ background: "transparent", border: "0.5px solid rgba(127,119,221,0.3)", color: "#9994b8", borderRadius: 10, padding: "13px 32px", fontSize: 15, cursor: "pointer", fontFamily: "inherit" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(127,119,221,0.5)"; e.currentTarget.style.color = "#c0baf0"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(127,119,221,0.3)"; e.currentTarget.style.color = "#9994b8"; }}>See how it works</button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
