"use client";

import { useRouter } from "next/navigation";
import NavBar from "@/components/v2/NavBar";
import Footer from "@/components/v2/Footer";

/* ------------------------------------------------------------------ */
/*  Shared mini-components                                             */
/* ------------------------------------------------------------------ */

const Pill = ({ children }: { children: string }) => (
  <span
    style={{
      background: "rgba(83,74,183,0.15)",
      border: "0.5px solid rgba(127,119,221,0.25)",
      borderRadius: 20,
      padding: "4px 12px",
      fontSize: 12,
      color: "#9994b8",
    }}
  >
    {children}
  </span>
);

const SmallPill = ({ children, color }: { children: string; color?: string }) => (
  <span
    style={{
      background: "rgba(127,119,221,0.08)",
      color: color || "#6b6690",
      borderRadius: 4,
      padding: "3px 8px",
      fontSize: 11,
    }}
  >
    {children}
  </span>
);

const VisualCard = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      background: "#13121d",
      border: "0.5px solid rgba(127,119,221,0.2)",
      borderRadius: 14,
      padding: 20,
      minHeight: 140,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {children}
  </div>
);

const Dot = ({ color }: { color: string }) => (
  <span
    style={{
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: color,
      flexShrink: 0,
    }}
  />
);

/* ------------------------------------------------------------------ */
/*  Step visuals                                                       */
/* ------------------------------------------------------------------ */

function Visual1() {
  return (
    <VisualCard>
      <div style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#0d0d14",
            border: "0.5px solid rgba(127,119,221,0.25)",
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 12,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span style={{ fontSize: 13, color: "#6b6690", flex: 1 }}>123 Oak Street, Oakland CA 94612</span>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: "#534AB7", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="#f0eeff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#4e4a6a" }}><Dot color="#1D9E75" />AVM $487,000</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#4e4a6a" }}><Dot color="#7F77DD" />Rent est. $2,840/mo</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#4e4a6a" }}><Dot color="#EF9F27" />15 comps found</span>
        </div>
      </div>
    </VisualCard>
  );
}

function Visual2() {
  const fields = [
    ["Beds", "3"], ["Baths", "2"],
    ["Sqft", "1,450"], ["Year", "1998"],
    ["AVM", "$487,000"], ["Rent", "$2,840"],
  ];
  return (
    <VisualCard>
      <div style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#e8e6f0" }}>Property Details</span>
          <span style={{ fontSize: 10, color: "#1D9E75", background: "rgba(29,158,117,0.12)", padding: "2px 8px", borderRadius: 4 }}>Data verified</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {fields.map(([label, value]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 8px", background: "#0d0d14", borderRadius: 6 }}>
              <span style={{ fontSize: 11, color: "#3a3758" }}>{label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#e8e6f0" }}>{value}</span>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#3a3758" strokeWidth="2"><path d="M11 4H4v16h16v-7M18 2l4 4-10 10H8v-4L18 2z"/></svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </VisualCard>
  );
}

function Visual3() {
  const strats = [
    { name: "BRRRR", sub: "Buy \u00B7 Rehab \u00B7 Rent \u00B7 Refi", active: true, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7F77DD" strokeWidth="2" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg> },
    { name: "Fix & Flip", sub: "ARV \u00B7 Rehab \u00B7 Profit", active: false, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b6690" strokeWidth="2" strokeLinecap="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg> },
    { name: "Buy & Hold", sub: "Cash flow \u00B7 Long term", active: false, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b6690" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { name: "House Hack", sub: "Live free \u00B7 Build equity", active: false, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b6690" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg> },
  ];
  return (
    <VisualCard>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%" }}>
        {strats.map((s) => (
          <div key={s.name} style={{ background: "#0d0d14", border: `0.5px solid ${s.active ? "rgba(127,119,221,0.5)" : "rgba(127,119,221,0.15)"}`, borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: s.active ? "#e8e6f0" : "#4e4a6a" }}>{s.name}</div>
            <div style={{ fontSize: 10, color: "#3a3758" }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </VisualCard>
  );
}

function Visual4() {
  const rows = [
    { label: "Purchase Price", value: "$1,070,000", hint: null },
    { label: "Down Payment", value: "10%", hint: "Hard money default" },
    { label: "Interest Rate", value: "12%", hint: "Hard money typical" },
  ];
  return (
    <VisualCard>
      <div style={{ width: "100%" }}>
        {rows.map((r, i) => (
          <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < rows.length - 1 ? "0.5px solid rgba(127,119,221,0.08)" : "none" }}>
            <span style={{ fontSize: 12, color: "#3a3758" }}>{r.label}</span>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#e8e6f0" }}>{r.value}</span>
              {r.hint && <div style={{ fontSize: 10, color: "#534AB7" }}>{r.hint}</div>}
            </div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          <span style={{ background: "#534AB7", color: "#f0eeff", borderRadius: 6, padding: "4px 10px", fontSize: 11 }}>Hard Money</span>
          <span style={{ background: "transparent", border: "0.5px solid rgba(127,119,221,0.2)", color: "#4e4a6a", borderRadius: 6, padding: "4px 10px", fontSize: 11 }}>Conventional</span>
        </div>
      </div>
    </VisualCard>
  );
}

function Visual5() {
  const steps = [
    { done: true, text: "Property found \u2014 3bd/2ba, 1,450 sqft" },
    { done: true, text: "AVM acquired \u2014 Est. value $487,000" },
    { done: true, text: "Analyzed 12 comparable sales" },
    { done: false, text: "Running AI analysis..." },
  ];
  return (
    <VisualCard>
      <div style={{ width: "100%", background: "#0d0d14", borderRadius: 10, padding: 14 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 12, color: s.done ? "#4e4a6a" : "#9994b8" }}>
            {s.done ? (
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(29,158,117,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="4" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
            ) : (
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#7F77DD", flexShrink: 0, animation: "hiw-pulse 1.2s infinite" }} />
            )}
            {s.text}
          </div>
        ))}
        <style>{`@keyframes hiw-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      </div>
    </VisualCard>
  );
}

function Visual6() {
  return (
    <VisualCard>
      <div style={{ width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: "#1D9E75", letterSpacing: "-1px" }}>7</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#1D9E75" }}>Strong Deal</div>
            <div style={{ fontSize: 10, color: "#3a3758" }}>deal score</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
          {[["Cap Rate", "6.8%"], ["Cash Flow", "+$612"], ["Cash-on-Cash", "9.2%"], ["5-Year ROI", "54%"]].map(([l, v]) => (
            <div key={l} style={{ background: "rgba(83,74,183,0.08)", borderRadius: 6, padding: "8px 10px" }}>
              <div style={{ fontSize: 10, color: "#3a3758" }}>{l}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e8e6f0" }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "rgba(162,45,45,0.08)", borderLeft: "2px solid #f09595", padding: "6px 10px", borderRadius: "0 6px 6px 0", fontSize: 11, color: "#f09595" }}>HIGH \u2014 Negative leverage detected</div>
      </div>
    </VisualCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Steps data                                                         */
/* ------------------------------------------------------------------ */

const stepsData = [
  { label: "Step 1", title: "Enter any property address.", description: "Type in any US property address and our system instantly pulls real data from RentCast \u2014 AVM value, rental estimates, comparable sales, and market data. No manual data entry required.", pills: ["Any US address", "Live RentCast data", "Instant lookup"], Visual: Visual1 },
  { label: "Step 2", title: "Confirm the property details.", description: "We surface every data point we found \u2014 beds, baths, square footage, estimated value, and rental estimate. Edit anything that looks wrong before running your analysis. Your numbers go in, your numbers come out.", pills: ["Editable fields", "RentCast verified", "ARV from comps"], Visual: Visual2 },
  { label: "Step 3", title: "Choose your investment strategy.", description: "Select from four battle-tested investment strategies. Each one uses a different financial model and AI prompt \u2014 built specifically for how that strategy actually works. No one-size-fits-all analysis here.", pills: ["BRRRR", "Fix & Flip", "Buy & Hold", "House Hack"], Visual: Visual3 },
  { label: "Step 4", title: "Set your deal numbers.", description: "Enter your purchase price, down payment, and strategy-specific inputs. Smart defaults pre-fill automatically \u2014 hard money at 10% down for flips, FHA at 3.5% for house hacks. Change anything you want.", pills: ["Smart defaults", "Strategy-aware", "Editable inputs"], Visual: Visual4 },
  { label: "Step 5", title: "Watch the AI work in real time.", description: "Our AI pulls everything together \u2014 property data, your inputs, financial calculations, and market context. You watch each step happen in real time. Pro Max runs three models simultaneously for independent perspectives.", pills: ["Real-time progress", "Pre-computed math", "3 models for Pro Max"], Visual: Visual5 },
  { label: "Step 6", title: "Your complete investment analysis.", description: "A full breakdown of every metric that matters \u2014 cap rate, cash flow, ROI, risk flags, AI narrative, and long-term projections. Pro Max shows three side-by-side analyses from different AI models so you can see where they agree and where they don\u2019t.", pills: ["Deal score 1-10", "Risk flags", "30-year projections", "Model comparison"], Visual: Visual6 },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function HowItWorksPage() {
  const router = useRouter();

  return (
    <div style={{ background: "#0d0d14", minHeight: "100vh" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "radial-gradient(circle, rgba(127,119,221,0.07) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <NavBar />

      <main className="page-main" style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "72px 24px 80px" }}>
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
            .step-grid {
              grid-template-columns: 1fr !important;
              gap: 20px !important;
            }
            .step-number-col {
              display: none !important;
            }
            .step-content {
              order: 1 !important;
            }
            .step-visual {
              order: 2 !important;
            }
            .step-wrapper {
              margin-bottom: 48px !important;
            }
            .timeline-line {
              display: none !important;
            }
            .model-cards-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
        {/* SECTION 1 — Header */}
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "1.5px", color: "#3C3489", marginBottom: 14 }}>How it works</p>
          <h1 className="page-headline" style={{ fontSize: 42, fontWeight: 700, color: "#f0eeff", letterSpacing: "-1.2px", marginBottom: 12, marginTop: 0 }}>From address to analysis in 30 seconds.</h1>
          <p style={{ fontSize: 16, color: "#4e4a6a", maxWidth: 560, margin: "0 auto 72px", lineHeight: 1.6 }}>Stop copy-pasting into ChatGPT. Enter any address and we handle everything &mdash; property data, financial modeling, and AI analysis.</p>
        </div>

        {/* SECTION 2 — Timeline */}
        <div style={{ position: "relative" }}>
          {/* Vertical line */}
          <div className="timeline-line" style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "linear-gradient(to bottom, rgba(127,119,221,0.4), rgba(127,119,221,0.05))", transform: "translateX(-0.5px)", zIndex: 0 }} />

          {stepsData.map((step, i) => {
            const isOdd = i % 2 === 0;
            const { Visual } = step;

            const contentBlock = (
              <div className="step-content" style={{ padding: "0 32px" }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "1.5px", color: "#534AB7", marginBottom: 10 }}>{step.label}</div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: "#f0eeff", letterSpacing: "-0.5px", marginBottom: 10, marginTop: 0 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: "#6b6690", lineHeight: 1.8, marginBottom: 16 }}>{step.description}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {step.pills.map((p) => <Pill key={p}>{p}</Pill>)}
                </div>
              </div>
            );

            return (
              <div key={i} className="step-grid step-wrapper" style={{ display: "grid", gridTemplateColumns: "1fr 80px 1fr", alignItems: "center", marginBottom: 80, position: "relative" }}>
                {isOdd ? contentBlock : <div className="step-visual"><Visual /></div>}
                <div className="step-number-col" style={{ display: "flex", justifyContent: "center" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#13121d", border: "1px solid rgba(127,119,221,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#7F77DD", position: "relative", zIndex: 2 }}>{i + 1}</div>
                </div>
                {isOdd ? <div className="step-visual"><Visual /></div> : contentBlock}
              </div>
            );
          })}
        </div>

        {/* SECTION 3 — Model tiers */}
        <div style={{ textAlign: "center", marginBottom: 64, marginTop: 16 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: "#f0eeff", letterSpacing: "-0.5px", marginBottom: 8 }}>The right AI for every deal.</h2>
          <p style={{ fontSize: 14, color: "#4e4a6a", marginBottom: 40 }}>Your plan determines which AI models power your analysis. Every tier gets unlimited analyses on all 4 strategies.</p>

          <div className="model-cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, textAlign: "left" }}>
            {/* Speed */}
            <div style={{ background: "#13121d", border: "0.5px solid rgba(127,119,221,0.15)", borderRadius: 14, padding: "22px 20px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9994b8" strokeWidth="2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              <span style={{ display: "inline-block", background: "rgba(127,119,221,0.1)", color: "#6b6690", borderRadius: 5, padding: "2px 8px", fontSize: 11, marginLeft: 8, verticalAlign: "middle" }}>Free</span>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#e8e6f0", margin: "12px 0 6px" }}>GPT-4o-mini</div>
              <p style={{ fontSize: 13, color: "#4e4a6a", lineHeight: 1.6, marginBottom: 14 }}>Fast, capable, and free. Great for quick deal screening before committing to deeper analysis.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}><SmallPill>Speed</SmallPill><SmallPill>Cost efficient</SmallPill><SmallPill>Reliable</SmallPill></div>
            </div>

            {/* Balanced */}
            <div style={{ background: "#13121d", border: "0.5px solid rgba(127,119,221,0.15)", borderRadius: 14, padding: "22px 20px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7F77DD" strokeWidth="2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              <span style={{ display: "inline-block", background: "rgba(83,74,183,0.2)", color: "#9994b8", borderRadius: 5, padding: "2px 8px", fontSize: 11, marginLeft: 8, verticalAlign: "middle" }}>Pro &mdash; $29/mo</span>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#e8e6f0", margin: "12px 0 6px" }}>Claude Sonnet &amp; GPT-4.1</div>
              <p style={{ fontSize: 13, color: "#4e4a6a", lineHeight: 1.6, marginBottom: 14 }}>Auto-routed by strategy. Sonnet for BRRRR and Buy &amp; Hold, GPT-4.1 for Fix &amp; Flip and House Hack. Best model for the job, every time.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}><SmallPill>Auto-routing</SmallPill><SmallPill>Deep reasoning</SmallPill><SmallPill>Clean prose</SmallPill></div>
            </div>

            {/* Max IQ */}
            <div style={{ background: "#13121d", border: "0.5px solid rgba(127,119,221,0.15)", borderRadius: 14, padding: "22px 20px" }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 0 }}>
                {["#7F77DD", "#1D9E75", "#EF9F27"].map((c) => <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />)}
              </div>
              <span style={{ display: "inline-block", background: "rgba(239,159,39,0.15)", color: "#EF9F27", borderRadius: 5, padding: "2px 8px", fontSize: 11, marginTop: 8, marginBottom: 4 }}>Pro Max &mdash; $79/mo</span>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#e8e6f0", margin: "8px 0 6px" }}>Opus &middot; GPT-4o &middot; Grok 3</div>
              <p style={{ fontSize: 13, color: "#4e4a6a", lineHeight: 1.6, marginBottom: 14 }}>Three models run in parallel. Risk analyst, deal sponsor, and quant modeler &mdash; all reviewing the same property at the same time.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}><SmallPill color="#EF9F27">3 models parallel</SmallPill><SmallPill color="#EF9F27">Comparison view</SmallPill><SmallPill color="#EF9F27">Max accuracy</SmallPill></div>
            </div>
          </div>
        </div>

        {/* SECTION 4 — Bottom CTA */}
        <div style={{ textAlign: "center", padding: 48, background: "rgba(83,74,183,0.06)", border: "0.5px solid rgba(127,119,221,0.15)", borderRadius: 20 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: "#f0eeff", letterSpacing: "-0.5px", marginBottom: 8, marginTop: 0 }}>Ready to analyze your first deal?</h2>
          <p style={{ fontSize: 15, color: "#4e4a6a", marginBottom: 28 }}>No account needed to start. Enter any address and see it in action.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <button onClick={() => router.push("/v2")} style={{ background: "#534AB7", color: "#f0eeff", padding: "13px 32px", borderRadius: 10, fontSize: 15, fontWeight: 500, border: "none", cursor: "pointer", fontFamily: "inherit" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#6258cc")} onMouseLeave={(e) => (e.currentTarget.style.background = "#534AB7")}>Try it free &rarr;</button>
            <button onClick={() => router.push("/v2/pricing")} style={{ background: "transparent", border: "0.5px solid rgba(127,119,221,0.3)", color: "#9994b8", borderRadius: 10, padding: "13px 32px", fontSize: 15, cursor: "pointer", fontFamily: "inherit" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(127,119,221,0.5)"; e.currentTarget.style.color = "#c0baf0"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(127,119,221,0.3)"; e.currentTarget.style.color = "#9994b8"; }}>View pricing</button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
