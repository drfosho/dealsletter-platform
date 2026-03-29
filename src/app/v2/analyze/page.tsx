"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useRef, useEffect } from "react";
import NavBar from "@/components/v2/NavBar";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AnalysisResult {
  // Legacy fields from server-side parseAnalysisResponse
  summary?: string;
  recommendation?: string;
  risks?: string[];
  opportunities?: string[];
  market_analysis?: string;
  full_analysis?: string;
  investment_strategy?: { type: string; details: string };
  financial_metrics?: {
    monthly_cash_flow?: number;
    cap_rate?: number;
    cash_on_cash_return?: number;
    roi?: number;
    total_investment?: number;
    annual_noi?: number;
    total_profit?: number;
    net_profit?: number;
    holding_costs?: number;
    monthly_rent?: number;
    arv?: number;
    profit_margin?: number;
    cash_returned?: number;
    cash_left_in_deal?: number;
    capital_recovery_percent?: number;
    is_infinite_return?: boolean;
  };
  // V2 JSON schema fields (from Claude direct JSON output)
  strategyType?: string;
  metrics?: {
    capRate?: number | null;
    cashOnCash?: number | null;
    roi?: number | null;
    arvEstimate?: number | null;
    equityCapture?: number | null;
    monthlyRent?: number | null;
    monthlyExpenses?: number | null;
    noi?: number | null;
  };
  cashFlow?: {
    monthly?: number | null;
    annual?: number | null;
  };
  proForma?: {
    purchasePrice?: number | null;
    rehabCost?: number | null;
    totalInvestment?: number | null;
    arvEstimate?: number | null;
    grossRent?: number | null;
    vacancy?: number | null;
    netOperatingIncome?: number | null;
    annualDebtService?: number | null;
  };
  riskFlags?: Array<{
    severity: "low" | "medium" | "high";
    flag: string;
    detail?: string;
  }>;
  narrative?: string;
  marketContext?: string;
  dealScore?: number;
}

interface EditedProperty {
  beds: string;
  baths: string;
  sqft: string;
  yearBuilt: string;
  propertyType: string;
  estimatedValue: string;
  estimatedRent: string;
  listPrice: string;
}

/* ------------------------------------------------------------------ */
/*  Strategy data                                                      */
/* ------------------------------------------------------------------ */

const strategies = [
  {
    name: "BRRRR",
    description:
      "Buy, rehab, rent, refi, repeat. Full equity capture & refi waterfall.",
  },
  {
    name: "Fix & Flip",
    description: "ARV, rehab budget, holding costs & net profit margin.",
  },
  {
    name: "Buy & Hold",
    description:
      "Long-term cash flow, cap rate & appreciation projections.",
  },
  {
    name: "House Hack",
    description:
      "Live-in rental math. Offset your mortgage with rental income.",
  },
] as const;

const propertyTypes = ["Single Family", "Multi-Family", "Condo", "Townhouse"];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmtCurrency(v: number): string {
  return "$" + Math.abs(v).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function fmtPct(v: number): string {
  return v.toFixed(1) + "%";
}

/* ------------------------------------------------------------------ */
/*  Sub-components for Results UI                                      */
/* ------------------------------------------------------------------ */

function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      style={{
        background: "#13121d",
        border: "0.5px solid rgba(127,119,221,0.15)",
        borderRadius: 12,
        padding: "16px 18px",
      }}
    >
      <p
        className="uppercase"
        style={{
          fontSize: 11,
          letterSpacing: "0.8px",
          color: "#3a3758",
          margin: "0 0 8px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "-0.5px",
          color,
          margin: 0,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function ProFormaRow({
  label,
  value,
  isLast,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: "8px 0",
        borderBottom: isLast
          ? "none"
          : "0.5px solid rgba(127,119,221,0.08)",
      }}
    >
      <span style={{ fontSize: 13, color: "#4e4a6a" }}>{label}</span>
      <span style={{ fontSize: 13, color: "#e8e6f0", fontWeight: 500 }}>
        {value}
      </span>
    </div>
  );
}

function RiskFlag({
  severity,
  flag,
  detail,
  isLast,
}: {
  severity: string;
  flag: string;
  detail?: string;
  isLast?: boolean;
}) {
  const badgeColors: Record<string, { bg: string; fg: string }> = {
    high: { bg: "rgba(162,45,45,0.15)", fg: "#f09595" },
    medium: { bg: "rgba(186,117,23,0.15)", fg: "#EF9F27" },
    low: { bg: "rgba(29,158,117,0.15)", fg: "#1D9E75" },
  };
  const c = badgeColors[severity] || badgeColors.medium;

  return (
    <div
      className="flex items-start"
      style={{
        padding: "10px 0",
        borderBottom: isLast
          ? "none"
          : "0.5px solid rgba(127,119,221,0.06)",
      }}
    >
      <span
        className="shrink-0 uppercase"
        style={{
          background: c.bg,
          color: c.fg,
          borderRadius: 5,
          padding: "2px 8px",
          fontSize: 11,
          fontWeight: 500,
        }}
      >
        {severity}
      </span>
      <div style={{ marginLeft: 10 }}>
        <span style={{ fontSize: 13, color: "#9994b8" }}>{flag}</span>
        {detail && (
          <p style={{ fontSize: 12, color: "#4e4a6a", marginTop: 3 }}>
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex gap-3" style={{ marginBottom: 12 }}>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex-1"
          style={{
            height: 52,
            background: "rgba(127,119,221,0.1)",
            borderRadius: 8,
            animation: "v2-skeleton-pulse 1.2s ease-in-out infinite",
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared input styles                                                */
/* ------------------------------------------------------------------ */

const fieldLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  color: "#3a3758",
  textTransform: "uppercase",
  letterSpacing: "0.6px",
  marginBottom: 6,
};

const fieldInputStyle: React.CSSProperties = {
  background: "#0d0d14",
  border: "0.5px solid rgba(127,119,221,0.2)",
  borderRadius: 8,
  padding: "10px 12px",
  color: "#e8e6f0",
  fontSize: 15,
  fontWeight: 600,
  width: "100%",
};

/* ------------------------------------------------------------------ */
/*  Main content                                                       */
/* ------------------------------------------------------------------ */

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const address = searchParams.get("address") || "";
  const selectedModel = searchParams.get("model") || "auto";

  /* --- Property data states --- */
  const [propertyData, setPropertyData] = useState<any>(null);
  const [editedProperty, setEditedProperty] = useState<EditedProperty>({
    beds: "",
    baths: "",
    sqft: "",
    yearBuilt: "",
    propertyType: "Single Family",
    estimatedValue: "",
    estimatedRent: "",
    listPrice: "",
  });
  const [propertyLoading, setPropertyLoading] = useState(true);
  const [propertyError, setPropertyError] = useState("");

  /* --- Analysis states --- */
  const [selectedStrategy, setSelectedStrategy] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [downPayment, setDownPayment] = useState("20");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [analysisError, setAnalysisError] = useState("");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [parsedResult, setParsedResult] = useState<AnalysisResult | null>(null);
  const [progressSteps, setProgressSteps] = useState<
    { step: number; label: string; status: string }[]
  >([]);

  const rawBufferRef = useRef("");

  const showRentInput =
    selectedStrategy === "Buy & Hold" || selectedStrategy === "House Hack";

  const apiStrategy = selectedStrategy
    ? ({
        BRRRR: "brrrr",
        "Fix & Flip": "flip",
        "Buy & Hold": "rental",
        "House Hack": "house-hack",
      } as Record<string, string>)[selectedStrategy]
    : "";

  /* ---------- Fetch property data on mount ----------------------- */

  useEffect(() => {
    if (!address) {
      setPropertyLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchPropertyData() {
      try {
        const res = await fetch("/api/v2/property-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address }),
        });

        const data = await res.json();

        if (cancelled) return;

        if (data.error && data.fallback) {
          setPropertyError("Property data unavailable — enter details manually");
          setPropertyLoading(false);
          return;
        }

        setPropertyData(data);

        // Extract using EXACT field paths from rentcast.ts normalizePropertyData
        const prop = data.property || {};
        const rental = data.rental || {};
        const comparables = data.comparables || {};
        const listing = data.listing || {};

        const edited: EditedProperty = {
          beds: String(prop.bedrooms || ""),
          baths: String(prop.bathrooms || ""),
          sqft: String(prop.squareFootage || ""),
          yearBuilt: String(prop.yearBuilt || ""),
          propertyType: prop.propertyType || "Single Family",
          // AVM value: comparables.value (normalized from RentCast price → value)
          estimatedValue: String(comparables.value || ""),
          // Rental estimate: rental.rentEstimate (normalized from RentCast rent → rentEstimate)
          estimatedRent: String(rental.rentEstimate || ""),
          // Active listing price
          listPrice: String(listing.price || listing.listPrice || ""),
        };

        setEditedProperty(edited);

        // Pre-populate purchase price: listing price > AVM estimate
        const prePrice = edited.listPrice || edited.estimatedValue;
        if (prePrice) setPurchasePrice(prePrice);

        // Pre-populate monthly rent
        if (edited.estimatedRent) setMonthlyRent(edited.estimatedRent);
      } catch (err) {
        if (!cancelled) {
          setPropertyError("Failed to fetch property data");
        }
      } finally {
        if (!cancelled) setPropertyLoading(false);
      }
    }

    fetchPropertyData();
    return () => {
      cancelled = true;
    };
  }, [address]);

  /* ---------- Update edited property helper ---------------------- */

  function updateEdited(field: keyof EditedProperty, value: string) {
    setEditedProperty((prev) => ({ ...prev, [field]: value }));
  }

  /* ---------- V2 JSON parser -------------------------------------- */

  function parseAnalysisStream(raw: string): AnalysisResult | null {
    try {
      // Strategy 1: Direct JSON parse
      try {
        const direct = JSON.parse(raw.trim());
        if (direct && typeof direct === "object") return direct;
      } catch {}

      // Strategy 2: Strip SSE "data: " prefixes and rejoin
      const sseStripped = raw
        .split("\n")
        .filter((line) => line.startsWith("data: "))
        .map((line) => line.slice(6).trim())
        .filter((line) => line && line !== "[DONE]")
        .join("");

      if (sseStripped.length > 0) {
        try {
          const parsed = JSON.parse(sseStripped);
          if (parsed && typeof parsed === "object") return parsed;
        } catch {}
      }

      // Strategy 3: Find ---JSON--- marker (V2 prompt output)
      const jsonMarkerIdx = raw.indexOf("---JSON---");
      if (jsonMarkerIdx !== -1) {
        const afterMarker = raw.slice(jsonMarkerIdx + 10).trim();
        const jsonMatch = afterMarker.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed && typeof parsed === "object") return parsed;
          } catch {}
        }
      }

      // Strategy 4: Extract JSON object from surrounding text
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed && typeof parsed === "object") return parsed;
        } catch {}
      }

      // Strategy 5: Strip markdown code fences if present
      const stripped = raw
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      try {
        const parsed = JSON.parse(stripped);
        if (parsed && typeof parsed === "object") return parsed;
      } catch {}

      console.error("All parse strategies failed. Raw length:", raw.length);
      console.error("Raw preview:", raw.substring(0, 500));
      return null;
    } catch (e) {
      console.error("parseAnalysisStream error:", e);
      return null;
    }
  }

  /* ---------- API call ------------------------------------------- */

  async function handleAnalyze() {
    if (!selectedStrategy || !purchasePrice) return;

    setIsAnalyzing(true);
    setStreamText("");
    setAnalysisError("");
    setHasAnalyzed(true);
    setParsedResult(null);
    setProgressSteps([]);
    rawBufferRef.current = "";

    // Use monthlyRent from state, or fall back to edited rent estimate
    const effectiveRent = monthlyRent || editedProperty.estimatedRent;

    // Accumulate full streamed text for post-stream parsing
    let accumulatedStreamText = "";
    // Track whether we got a parsed result from the complete event
    let gotCompleteEvent = false;

    try {
      const response = await fetch("/api/analysis/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          strategy: apiStrategy,
          purchasePrice: parseFloat(purchasePrice),
          downPayment: parseFloat(downPayment) / 100,
          loanTerms: { years: 30, interestRate: 7.5 },
          units: 1,
          monthlyRent: effectiveRent ? parseFloat(effectiveRent) : undefined,
          // V2 — pass full RentCast data + user-edited overrides
          propertyData: propertyData
            ? {
                ...propertyData,
                property: {
                  ...(propertyData.property || {}),
                  bedrooms: parseFloat(editedProperty.beds) || propertyData.property?.bedrooms,
                  bathrooms: parseFloat(editedProperty.baths) || propertyData.property?.bathrooms,
                  squareFootage: parseFloat(editedProperty.sqft) || propertyData.property?.squareFootage,
                  yearBuilt: parseFloat(editedProperty.yearBuilt) || propertyData.property?.yearBuilt,
                  propertyType: editedProperty.propertyType || propertyData.property?.propertyType,
                },
                rental: {
                  ...(propertyData.rental || {}),
                  rentEstimate: parseFloat(editedProperty.estimatedRent) || propertyData.rental?.rentEstimate,
                },
                comparables: {
                  ...(propertyData.comparables || {}),
                  value: parseFloat(editedProperty.estimatedValue) || propertyData.comparables?.value,
                },
              }
            : undefined,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Analysis failed");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response stream");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        rawBufferRef.current += chunk;

        const lines = rawBufferRef.current.split("\n");
        rawBufferRef.current = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          const json = trimmed.slice(6);
          if (json === "[DONE]") continue;

          try {
            const evt = JSON.parse(json);

            if (evt.type === "progress") {
              setProgressSteps((prev) => {
                const idx = prev.findIndex((p) => p.step === evt.step);
                const entry = {
                  step: evt.step,
                  label: evt.label,
                  status: evt.status,
                };
                if (idx >= 0) {
                  const next = [...prev];
                  next[idx] = entry;
                  return next;
                }
                return [...prev, entry];
              });
            }

            if (evt.type === "stream") {
              accumulatedStreamText += evt.text;
              setStreamText((prev) => prev + evt.text);
            }

            if (evt.type === "complete" && evt.result?.analysis) {
              gotCompleteEvent = true;
              setParsedResult(evt.result.analysis);
            }

            if (evt.type === "error") {
              throw new Error(evt.message || "Analysis failed");
            }
          } catch (parseErr: any) {
            if (
              parseErr.message &&
              parseErr.message !== "Unexpected end of JSON input"
            ) {
              if (json.includes('"type":"error"')) throw parseErr;
            }
          }
        }
      }

      // If the server's complete event didn't give us a parsed result,
      // try parsing the accumulated Claude text directly (V2 JSON output)
      if (!gotCompleteEvent && accumulatedStreamText) {
        const parsed = parseAnalysisStream(accumulatedStreamText);
        if (parsed) {
          setParsedResult(parsed);
        } else {
          console.warn("Could not parse response — showing raw output");
        }

        if (process.env.NODE_ENV === "development") {
          console.group("V2 Analysis Debug");
          console.log("Raw response length:", accumulatedStreamText.length);
          console.log(
            "Raw response preview:",
            accumulatedStreamText.substring(0, 1000)
          );
          console.log("Parsed result:", parsed);
          console.groupEnd();
        }
      }
    } catch (err: any) {
      setAnalysisError(err.message || "Unknown error");
      setHasAnalyzed(false);
    } finally {
      setIsAnalyzing(false);
    }
  }

  /* ---------- Derived values ------------------------------------- */
  // Support both legacy (server-parsed) and V2 (Claude JSON) field names
  const fm = parsedResult?.financial_metrics;
  const v2m = parsedResult?.metrics;
  const v2cf = parsedResult?.cashFlow;
  const v2pf = parsedResult?.proForma;

  const showArv =
    selectedStrategy === "BRRRR" || selectedStrategy === "Fix & Flip";
  const showEquityCapture = selectedStrategy === "BRRRR";

  const metricCards: { label: string; value: string; color: string }[] = [];

  const capRate = v2m?.capRate ?? fm?.cap_rate;
  if (capRate != null)
    metricCards.push({ label: "Cap Rate", value: fmtPct(capRate), color: "#f0eeff" });

  const cashOnCash = v2m?.cashOnCash ?? fm?.cash_on_cash_return;
  if (cashOnCash != null)
    metricCards.push({ label: "Cash-on-Cash", value: fmtPct(cashOnCash), color: "#7F77DD" });

  const monthlyCF = v2cf?.monthly ?? fm?.monthly_cash_flow;
  if (monthlyCF != null)
    metricCards.push({
      label: "Monthly Cash Flow",
      value: (monthlyCF >= 0 ? "+" : "-") + fmtCurrency(monthlyCF),
      color: monthlyCF >= 0 ? "#1D9E75" : "#f09595",
    });

  const roi = v2m?.roi ?? fm?.roi;
  if (roi != null)
    metricCards.push({ label: "5-Year ROI", value: fmtPct(roi), color: "#f0eeff" });

  const arvVal = v2m?.arvEstimate ?? v2pf?.arvEstimate ?? fm?.arv;
  if (showArv && arvVal != null)
    metricCards.push({ label: "ARV Estimate", value: fmtCurrency(arvVal), color: "#f0eeff" });

  const equityCapture = v2m?.equityCapture ?? fm?.cash_returned;
  if (showEquityCapture && equityCapture != null)
    metricCards.push({ label: "Equity Capture", value: fmtCurrency(equityCapture), color: "#7F77DD" });

  /* --- Pro forma rows (V2 fields preferred, legacy fallback) --- */
  const proFormaRows: { label: string; value: string }[] = [];

  const pfPurchase = v2pf?.purchasePrice;
  if (pfPurchase != null)
    proFormaRows.push({ label: "Purchase Price", value: fmtCurrency(pfPurchase) });

  const pfRehab = v2pf?.rehabCost;
  if (pfRehab != null)
    proFormaRows.push({ label: "Rehab Cost", value: fmtCurrency(pfRehab) });

  const totalInv = v2pf?.totalInvestment ?? fm?.total_investment;
  if (totalInv != null)
    proFormaRows.push({ label: "Total Investment", value: fmtCurrency(totalInv) });

  if (showArv && arvVal != null && !proFormaRows.some((r) => r.label === "ARV Estimate"))
    proFormaRows.push({ label: "ARV", value: fmtCurrency(arvVal) });

  const grossRent = v2pf?.grossRent ?? fm?.monthly_rent;
  if (grossRent != null)
    proFormaRows.push({ label: "Gross Rent", value: fmtCurrency(grossRent) + "/mo" });

  const vacancy = v2pf?.vacancy;
  if (vacancy != null)
    proFormaRows.push({ label: "Vacancy", value: fmtCurrency(vacancy) + "/mo" });

  const noi = v2pf?.netOperatingIncome ?? fm?.annual_noi;
  if (noi != null)
    proFormaRows.push({ label: "Net Operating Income", value: fmtCurrency(noi) + "/yr" });

  const debtService = v2pf?.annualDebtService;
  if (debtService != null)
    proFormaRows.push({ label: "Annual Debt Service", value: fmtCurrency(debtService) + "/yr" });

  const holdingCosts = fm?.holding_costs;
  if (holdingCosts != null && !v2pf)
    proFormaRows.push({ label: "Holding Costs", value: fmtCurrency(holdingCosts) });

  const totalProfit = fm?.total_profit;
  if (totalProfit != null && !v2pf)
    proFormaRows.push({ label: "Total Profit", value: fmtCurrency(totalProfit) });

  /* --- Risk flags (V2 structured riskFlags preferred, legacy fallback) --- */
  const riskItems: { severity: string; flag: string; detail?: string }[] = [];
  if (parsedResult?.riskFlags && parsedResult.riskFlags.length > 0) {
    parsedResult.riskFlags.forEach((rf) => {
      riskItems.push({ severity: rf.severity, flag: rf.flag, detail: rf.detail });
    });
  } else if (parsedResult?.risks) {
    parsedResult.risks.forEach((r) => {
      const lower = r.toLowerCase();
      let severity = "medium";
      if (lower.includes("high") || lower.includes("significant") || lower.includes("major"))
        severity = "high";
      else if (lower.includes("low") || lower.includes("minor") || lower.includes("minimal"))
        severity = "low";
      riskItems.push({ severity, flag: r });
    });
  }

  /* --- Deal score --- */
  const dealScore = parsedResult?.dealScore;
  let scoreColor = "#EF9F27";
  let scoreLabel = "Moderate Deal";
  let scoreSub =
    "Acceptable returns with some risk factors. Negotiate hard on price.";
  if (dealScore != null) {
    if (dealScore >= 8) {
      scoreColor = "#1D9E75";
      scoreLabel = "Strong Deal";
      scoreSub =
        "Above-average returns for this market. Numbers support moving forward.";
    } else if (dealScore <= 4) {
      scoreColor = "#f09595";
      scoreLabel = "Weak Deal";
      scoreSub =
        "Below-average returns. This deal needs significant price reduction to make sense.";
    }
  }

  const dataVerified = !!propertyData && !propertyError;

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0d0d14" }}
    >
      <style>{`
        @keyframes v2-pulse-loader {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
        @keyframes v2-skeleton-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .v2-input:focus {
          border-color: rgba(127,119,221,0.5) !important;
          outline: none;
        }
      `}</style>

      <NavBar />

      <main
        className="mx-auto w-full"
        style={{ maxWidth: 860, padding: "40px 24px" }}
      >
        {/* SECTION 1 — Header */}
        <span
          className="mb-6 inline-block cursor-pointer"
          style={{ color: "#4e4a6a", fontSize: 13 }}
          onClick={() => router.push("/v2")}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#b0acd8")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#4e4a6a")}
        >
          ← Back to search
        </span>

        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#f0eeff",
            letterSpacing: "-0.5px",
            margin: 0,
          }}
        >
          {address || "No address provided"}
        </h1>

        <span
          className="mt-1.5 inline-block"
          style={{
            background: "rgba(83,74,183,0.2)",
            color: "#9994b8",
            borderRadius: 6,
            padding: "3px 10px",
            fontSize: 12,
          }}
        >
          AI: {selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1)}
        </span>

        {/* SECTION 1.5 — Property confirmation card */}
        {!hasAnalyzed && (
          <div
            style={{
              background: "#13121d",
              border: "0.5px solid rgba(127,119,221,0.2)",
              borderRadius: 16,
              padding: "22px 24px",
              marginTop: 24,
              marginBottom: 28,
            }}
          >
            {/* Card header */}
            <div
              className="mb-4 flex items-start justify-between"
              style={{ marginBottom: 18 }}
            >
              <div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#e8e6f0",
                    margin: 0,
                  }}
                >
                  Property Details
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "#4e4a6a",
                    marginTop: 3,
                  }}
                >
                  Pulled from RentCast — edit anything that looks wrong
                </p>
              </div>

              {!propertyLoading && (
                <span
                  className="flex shrink-0 items-center gap-1.5"
                  style={{
                    background: dataVerified
                      ? "rgba(29,158,117,0.15)"
                      : "rgba(186,117,23,0.15)",
                    color: dataVerified ? "#1D9E75" : "#EF9F27",
                    borderRadius: 5,
                    padding: "3px 10px",
                    fontSize: 11,
                  }}
                >
                  <span
                    className="inline-block rounded-full"
                    style={{
                      width: 6,
                      height: 6,
                      background: dataVerified ? "#1D9E75" : "#EF9F27",
                    }}
                  />
                  {dataVerified ? "Data verified" : "Using estimates"}
                </span>
              )}
            </div>

            {/* Loading skeleton */}
            {propertyLoading && (
              <>
                <SkeletonRow />
                <SkeletonRow />
              </>
            )}

            {/* Editable fields */}
            {!propertyLoading && (
              <>
                {/* Row 1 — physical details */}
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <label style={fieldLabelStyle}>Bedrooms</label>
                    <input
                      type="number"
                      value={editedProperty.beds}
                      onChange={(e) => updateEdited("beds", e.target.value)}
                      className="v2-input"
                      style={fieldInputStyle}
                    />
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>Bathrooms</label>
                    <input
                      type="number"
                      step="0.5"
                      value={editedProperty.baths}
                      onChange={(e) => updateEdited("baths", e.target.value)}
                      className="v2-input"
                      style={fieldInputStyle}
                    />
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>Sq Footage</label>
                    <input
                      type="number"
                      value={editedProperty.sqft}
                      onChange={(e) => updateEdited("sqft", e.target.value)}
                      className="v2-input"
                      style={fieldInputStyle}
                    />
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>Year Built</label>
                    <input
                      type="number"
                      value={editedProperty.yearBuilt}
                      onChange={(e) =>
                        updateEdited("yearBuilt", e.target.value)
                      }
                      className="v2-input"
                      style={fieldInputStyle}
                    />
                  </div>
                </div>

                {/* Row 2 — financial data */}
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <label style={fieldLabelStyle}>
                      Estimated Value (AVM)
                    </label>
                    <input
                      type="number"
                      value={editedProperty.estimatedValue}
                      onChange={(e) =>
                        updateEdited("estimatedValue", e.target.value)
                      }
                      className="v2-input"
                      style={fieldInputStyle}
                    />
                    <span
                      style={{
                        fontSize: 10,
                        color: "#3a3758",
                        marginTop: 4,
                        display: "block",
                      }}
                    >
                      RentCast AVM estimate
                    </span>
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>Est. Monthly Rent</label>
                    <input
                      type="number"
                      value={editedProperty.estimatedRent}
                      onChange={(e) =>
                        updateEdited("estimatedRent", e.target.value)
                      }
                      className="v2-input"
                      style={fieldInputStyle}
                    />
                    <span
                      style={{
                        fontSize: 10,
                        color: "#3a3758",
                        marginTop: 4,
                        display: "block",
                      }}
                    >
                      RentCast rental estimate
                    </span>
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>List Price</label>
                    <input
                      type="number"
                      value={editedProperty.listPrice}
                      onChange={(e) =>
                        updateEdited("listPrice", e.target.value)
                      }
                      placeholder="Not listed"
                      className="v2-input"
                      style={fieldInputStyle}
                    />
                    <span
                      style={{
                        fontSize: 10,
                        color: "#3a3758",
                        marginTop: 4,
                        display: "block",
                      }}
                    >
                      Active listing price (if available)
                    </span>
                  </div>
                </div>

                {/* Property type pills */}
                <div>
                  <label style={fieldLabelStyle}>Property Type</label>
                  <div className="flex gap-2">
                    {propertyTypes.map((pt) => {
                      const isActive = editedProperty.propertyType === pt;
                      return (
                        <button
                          key={pt}
                          onClick={() => updateEdited("propertyType", pt)}
                          className="cursor-pointer transition-colors"
                          style={{
                            background: isActive
                              ? "rgba(83,74,183,0.25)"
                              : "transparent",
                            color: isActive ? "#c0baf0" : "#4e4a6a",
                            border: isActive
                              ? "0.5px solid rgba(127,119,221,0.5)"
                              : "0.5px solid rgba(127,119,221,0.1)",
                            borderRadius: 6,
                            padding: "5px 14px",
                            fontSize: 12,
                          }}
                        >
                          {pt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* SECTION 2 — Strategy selector */}
        {!hasAnalyzed && !propertyLoading && (
          <>
            <p
              style={{
                fontSize: 14,
                color: "#4e4a6a",
                marginBottom: 14,
              }}
            >
              Select your investment strategy
            </p>

            <div
              className="grid"
              style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}
            >
              {strategies.map((s) => {
                const isSelected = selectedStrategy === s.name;
                return (
                  <div
                    key={s.name}
                    className="cursor-pointer"
                    style={{
                      background: isSelected ? "#1a192b" : "#13121d",
                      border: isSelected
                        ? "0.5px solid rgba(127,119,221,0.6)"
                        : "0.5px solid rgba(127,119,221,0.15)",
                      borderRadius: 12,
                      padding: 18,
                      transition: "border-color 0.2s",
                    }}
                    onClick={() => setSelectedStrategy(s.name)}
                    onMouseEnter={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.borderColor =
                          "rgba(127,119,221,0.35)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.borderColor =
                          "rgba(127,119,221,0.15)";
                    }}
                  >
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#d8d4f4",
                        margin: 0,
                      }}
                    >
                      {s.name}
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: "#4a4668",
                        marginTop: 4,
                        lineHeight: 1.5,
                      }}
                    >
                      {s.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* SECTION 3 — Quick inputs */}
        {selectedStrategy && !hasAnalyzed && (
          <div className="mt-5 flex gap-3">
            <div className="flex-1">
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "#4e4a6a",
                  marginBottom: 6,
                }}
              >
                Purchase Price
              </label>
              <input
                type="number"
                placeholder="e.g. 450000"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="v2-input w-full"
                style={{
                  background: "#13121d",
                  border: "0.5px solid rgba(127,119,221,0.2)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  color: "#e8e6f0",
                  fontSize: 14,
                }}
              />
            </div>

            <div className="flex-1">
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "#4e4a6a",
                  marginBottom: 6,
                }}
              >
                Down Payment %
              </label>
              <input
                type="number"
                placeholder="20"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
                className="v2-input w-full"
                style={{
                  background: "#13121d",
                  border: "0.5px solid rgba(127,119,221,0.2)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  color: "#e8e6f0",
                  fontSize: 14,
                }}
              />
            </div>

            {showRentInput && (
              <div className="flex-1">
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: "#4e4a6a",
                    marginBottom: 6,
                  }}
                >
                  Est. Monthly Rent
                </label>
                <input
                  type="number"
                  placeholder="e.g. 2800"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  className="v2-input w-full"
                  style={{
                    background: "#13121d",
                    border: "0.5px solid rgba(127,119,221,0.2)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    color: "#e8e6f0",
                    fontSize: 14,
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* SECTION 4 — Analyze button */}
        {selectedStrategy && !hasAnalyzed && (
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="cursor-pointer transition-colors"
            style={{
              marginTop: 24,
              background: "#534AB7",
              color: "#f0eeff",
              padding: "13px 32px",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 500,
              border: "none",
              opacity: isAnalyzing ? 0.5 : 1,
              cursor: isAnalyzing ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!isAnalyzing) e.currentTarget.style.background = "#6258cc";
            }}
            onMouseLeave={(e) => {
              if (!isAnalyzing) e.currentTarget.style.background = "#534AB7";
            }}
          >
            Analyze this property →
          </button>
        )}

        {/* SECTION 5 — Loading state with progress steps */}
        {isAnalyzing && (
          <div className="mt-12">
            {progressSteps.length > 0 && (
              <div
                className="mb-6"
                style={{ maxWidth: 320, margin: "0 auto" }}
              >
                {progressSteps.map((ps) => (
                  <div
                    key={ps.step}
                    className="flex items-center gap-3"
                    style={{ padding: "6px 0" }}
                  >
                    {ps.status === "complete" ? (
                      <span style={{ color: "#1D9E75", fontSize: 14 }}>
                        ✓
                      </span>
                    ) : (
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          background: "#7F77DD",
                          borderRadius: "50%",
                          animation:
                            "v2-pulse-loader 1.5s ease-in-out infinite",
                        }}
                      />
                    )}
                    <span
                      style={{
                        fontSize: 13,
                        color:
                          ps.status === "complete" ? "#1D9E75" : "#4e4a6a",
                      }}
                    >
                      {ps.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {streamText && (
              <div
                style={{
                  background: "#13121d",
                  border: "0.5px solid rgba(127,119,221,0.15)",
                  borderRadius: 12,
                  padding: "20px 22px",
                  maxHeight: 200,
                  overflowY: "auto",
                  color: "#4e4a6a",
                  fontSize: 13,
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                }}
              >
                {streamText}
              </div>
            )}

            {!streamText && (
              <div className="text-center">
                <div
                  className="mx-auto mb-4"
                  style={{
                    width: 12,
                    height: 12,
                    background: "#7F77DD",
                    borderRadius: "50%",
                    animation: "v2-pulse-loader 1.5s ease-in-out infinite",
                  }}
                />
                <p style={{ fontSize: 14, color: "#4e4a6a", margin: 0 }}>
                  Analyzing property with AI...
                </p>
                <p style={{ fontSize: 12, color: "#3a3758", marginTop: 6 }}>
                  This usually takes 15–30 seconds
                </p>
              </div>
            )}
          </div>
        )}

        {/* SECTION 6 — Parsed Results */}
        {!isAnalyzing && parsedResult && (
          <div className="mt-8">
            <div className="mb-6 flex items-center justify-between">
              <span
                className="flex items-center gap-2"
                style={{ fontSize: 13, color: "#1D9E75" }}
              >
                <span
                  className="inline-block rounded-full"
                  style={{ width: 7, height: 7, background: "#1D9E75" }}
                />
                Analysis complete
              </span>
              <button
                className="cursor-pointer transition-colors"
                style={{
                  background: "transparent",
                  border: "0.5px solid rgba(127,119,221,0.25)",
                  color: "#6b6690",
                  borderRadius: 8,
                  padding: "7px 16px",
                  fontSize: 13,
                }}
                onClick={() => router.push("/v2")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#9994b8";
                  e.currentTarget.style.borderColor =
                    "rgba(127,119,221,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#6b6690";
                  e.currentTarget.style.borderColor =
                    "rgba(127,119,221,0.25)";
                }}
              >
                Run another analysis
              </button>
            </div>

            {/* Deal Score */}
            {dealScore != null && (
              <div
                className="mb-5 flex items-center"
                style={{
                  background: "#13121d",
                  border: "0.5px solid rgba(127,119,221,0.15)",
                  borderRadius: 12,
                  padding: "20px 22px",
                  gap: 20,
                }}
              >
                <div className="shrink-0 text-center">
                  <p
                    style={{
                      fontSize: 48,
                      fontWeight: 700,
                      letterSpacing: "-2px",
                      color: scoreColor,
                      margin: 0,
                      lineHeight: 1,
                    }}
                  >
                    {dealScore}
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#3a3758",
                      margin: "4px 0 0",
                    }}
                  >
                    / 10 deal score
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: scoreColor,
                      margin: 0,
                    }}
                  >
                    {scoreLabel}
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#4e4a6a",
                      marginTop: 4,
                      lineHeight: 1.6,
                    }}
                  >
                    {scoreSub}
                  </p>
                </div>
              </div>
            )}

            {/* Recommendation banner */}
            {parsedResult.recommendation && (
              <div
                className="mb-5"
                style={{
                  background: "rgba(29,158,117,0.08)",
                  border: "0.5px solid rgba(29,158,117,0.25)",
                  borderRadius: 12,
                  padding: "14px 18px",
                }}
              >
                <span
                  className="flex items-start gap-2"
                  style={{
                    fontSize: 14,
                    color: "#1D9E75",
                    lineHeight: 1.6,
                  }}
                >
                  <span
                    className="mt-1.5 inline-block shrink-0 rounded-full"
                    style={{ width: 7, height: 7, background: "#1D9E75" }}
                  />
                  {parsedResult.recommendation}
                </span>
              </div>
            )}

            {metricCards.length > 0 && (
              <div
                className="mb-5 grid"
                style={{
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: 10,
                }}
              >
                {metricCards.map((mc) => (
                  <MetricCard key={mc.label} {...mc} />
                ))}
              </div>
            )}

            {proFormaRows.length > 0 && (
              <div
                className="mb-5"
                style={{
                  background: "#13121d",
                  border: "0.5px solid rgba(127,119,221,0.15)",
                  borderRadius: 12,
                  padding: "20px 22px",
                }}
              >
                <p
                  className="uppercase"
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.8px",
                    color: "#3a3758",
                    margin: "0 0 14px",
                  }}
                >
                  Pro Forma
                </p>
                {proFormaRows.map((row, i) => (
                  <ProFormaRow
                    key={row.label}
                    label={row.label}
                    value={row.value}
                    isLast={i === proFormaRows.length - 1}
                  />
                ))}
              </div>
            )}

            {riskItems.length > 0 && (
              <div className="mb-5">
                <p
                  className="uppercase"
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.8px",
                    color: "#3a3758",
                    margin: "0 0 12px",
                  }}
                >
                  Risk Flags
                </p>
                {riskItems.map((ri, i) => (
                  <RiskFlag
                    key={i}
                    severity={ri.severity}
                    flag={ri.flag}
                    detail={ri.detail}
                    isLast={i === riskItems.length - 1}
                  />
                ))}
              </div>
            )}

            {(parsedResult.narrative || parsedResult.summary || parsedResult.full_analysis) && (
              <div
                className="mb-5"
                style={{
                  background: "#13121d",
                  border: "0.5px solid rgba(127,119,221,0.15)",
                  borderRadius: 12,
                  padding: "20px 22px",
                }}
              >
                <p
                  className="uppercase"
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.8px",
                    color: "#3a3758",
                    margin: "0 0 12px",
                  }}
                >
                  AI Analysis
                </p>
                <p
                  style={{
                    fontSize: 14,
                    color: "#9994b8",
                    lineHeight: 1.8,
                    margin: 0,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {parsedResult.narrative || parsedResult.full_analysis || parsedResult.summary || ""}
                </p>
              </div>
            )}

            {/* Market Context */}
            {parsedResult.marketContext && (
              <div
                className="mb-5"
                style={{
                  background: "#13121d",
                  border: "0.5px solid rgba(127,119,221,0.15)",
                  borderRadius: 12,
                  padding: "20px 22px",
                }}
              >
                <p
                  className="uppercase"
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.8px",
                    color: "#3a3758",
                    margin: "0 0 12px",
                  }}
                >
                  Market Context
                </p>
                <p
                  style={{
                    fontSize: 14,
                    color: "#9994b8",
                    lineHeight: 1.8,
                    margin: 0,
                  }}
                >
                  {parsedResult.marketContext}
                </p>
              </div>
            )}

            {/* TODO Prompt 13 — Free tier blur gate goes here */}
          </div>
        )}

        {/* Fallback: raw output when parsing failed */}
        {!isAnalyzing && !parsedResult && streamText && (
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <span style={{ fontSize: 13, color: "#1D9E75" }}>
                Analysis complete
              </span>
              <button
                className="cursor-pointer transition-colors"
                style={{
                  background: "transparent",
                  border: "0.5px solid rgba(127,119,221,0.25)",
                  color: "#6b6690",
                  borderRadius: 8,
                  padding: "7px 16px",
                  fontSize: 13,
                }}
                onClick={() => router.push("/v2")}
              >
                Run another analysis
              </button>
            </div>
            <details>
              <summary
                className="cursor-pointer"
                style={{
                  fontSize: 12,
                  color: "#3a3758",
                  padding: "8px 0",
                }}
              >
                View raw output
              </summary>
              <div
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: 12,
                  color: "#4e4a6a",
                  marginTop: 8,
                  maxHeight: 300,
                  overflowY: "auto",
                  background: "#13121d",
                  border: "0.5px solid rgba(127,119,221,0.15)",
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                {streamText}
              </div>
            </details>
          </div>
        )}

        {/* ERROR STATE */}
        {analysisError && (
          <div
            className="mt-8"
            style={{
              padding: 20,
              background: "rgba(162,45,45,0.1)",
              border: "0.5px solid rgba(162,45,45,0.3)",
              borderRadius: 12,
            }}
          >
            <p style={{ fontSize: 14, color: "#f09595", margin: 0 }}>
              Something went wrong: {analysisError}
            </p>
            <p style={{ fontSize: 12, color: "#6b3a3a", marginTop: 6 }}>
              Please try again or go back to search
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page export with Suspense                                          */
/* ------------------------------------------------------------------ */

export default function AnalyzePage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ backgroundColor: "#0d0d14" }}
        >
          <p style={{ color: "#4e4a6a" }}>Loading...</p>
        </div>
      }
    >
      <AnalyzeContent />
    </Suspense>
  );
}
