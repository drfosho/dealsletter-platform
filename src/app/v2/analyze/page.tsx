"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import NavBar from "@/components/v2/NavBar";
import AnalysisResults from "@/components/v2/AnalysisResults";
import { createClient } from "@/lib/supabase/client";
import {
  useProMaxAnalysis,
  PRO_MAX_MODELS,
} from "@/hooks/useProMaxAnalysis";

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
/*  Tier mapping helper                                                */
/* ------------------------------------------------------------------ */

const mapToV2Tier = (tier: string): "free" | "pro" | "pro_max" => {
  if (tier === "pro-plus" || tier === "pro_plus" || tier === "premium")
    return "pro_max";
  if (tier === "pro" || tier === "professional") return "pro";
  return "free";
};

/* ------------------------------------------------------------------ */
/*  Multifamily helper                                                 */
/* ------------------------------------------------------------------ */

const inferUnitCount = (propertyType: string): number => {
  const pt = propertyType?.toLowerCase() || "";
  if (pt.includes("duplex")) return 2;
  if (pt.includes("triplex")) return 3;
  if (
    pt.includes("fourplex") ||
    pt.includes("quadplex") ||
    pt.includes("4-plex") ||
    pt.includes("4 plex")
  )
    return 4;
  if (
    pt.includes("multi") ||
    pt.includes("apartment") ||
    pt.includes("5+")
  )
    return 0; // 0 = unknown, prompt user
  return 1;
};

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
  const requestedModel = searchParams.get("model") || "speed";
  const [selectedModel, setSelectedModel] = useState("speed");

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
  const [arvAnalysis, setArvAnalysis] = useState<{
    arvEstimate: number | null;
    compsUsed: number;
    confidence: string;
    pricePerSqft: number | null;
    avm: number | null;
    note: string;
  } | null>(null);

  /* --- Analysis states --- */
  const [selectedStrategy, setSelectedStrategy] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [downPayment, setDownPayment] = useState("20");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [loanType, setLoanType] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [points, setPoints] = useState("");
  const [rehabCost, setRehabCost] = useState("");
  const [afterRepairValue, setAfterRepairValue] = useState("");
  const [holdingMonths, setHoldingMonths] = useState("");
  const [closingCosts, setClosingCosts] = useState("3");
  const [propertyTax, setPropertyTax] = useState("");
  const [insurance, setInsurance] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [analysisError, setAnalysisError] = useState("");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [parsedResult, setParsedResult] = useState<AnalysisResult | null>(null);
  const [serverCalculations, setServerCalculations] = useState<any>(null);
  const [modelInfo, setModelInfo] = useState<{
    provider: string;
    model: string;
    tierLabel: string;
    modelLabel: string;
  } | null>(null);
  const [userTier, setUserTier] = useState<"free" | "pro" | "pro_max">("free");
  const [isLoadingTier, setIsLoadingTier] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [progressSteps, setProgressSteps] = useState<
    Array<{ step: string; detail: string; timestamp: number }>
  >([]);
  const [currentStep, setCurrentStep] = useState("");

  // Multifamily rent roll
  const [unitCount, setUnitCount] = useState<number>(1);
  const [unitRents, setUnitRents] = useState<
    Array<{
      unitNumber: number;
      bedrooms: string;
      bathrooms: string;
      monthlyRent: string;
      notes: string;
    }>
  >([]);
  const [isMultifamily, setIsMultifamily] = useState(false);

  // Pro Max parallel analysis
  const {
    modelResults,
    isRunning: isProMaxRunning,
    completedCount,
    totalModels,
    resetResults: resetProMaxResults,
    runParallelAnalysis,
  } = useProMaxAnalysis();
  const [proMaxMode, setProMaxMode] = useState(false);
  const [expandedModel, setExpandedModel] = useState<string | null>(null);

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
        setArvAnalysis(data.arvAnalysis || null);

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

        // Only pre-populate purchase price from list price — never from AVM
        // AVM is a valuation estimate, not a price
        if (edited.listPrice && parseFloat(edited.listPrice) > 0) {
          setPurchasePrice(edited.listPrice);
        }
        // If no list price, leave purchasePrice EMPTY so user must enter it

        // Initialize multifamily state from property type
        const inferredUnits = inferUnitCount(
          prop.propertyType || prop.type || ""
        );

        if (inferredUnits === 0) {
          setUnitCount(4);
          setIsMultifamily(true);
        } else if (inferredUnits > 1) {
          setUnitCount(inferredUnits);
          setIsMultifamily(true);
        } else {
          setUnitCount(1);
          setIsMultifamily(false);
        }

        const rentcastRentPerUnit = parseFloat(
          String(rental.rentEstimate || rental.rent || "0")
        );
        const units = inferredUnits > 0 ? inferredUnits : 4;

        if (units > 1) {
          // Property-level beds/baths are TOTALS — divide by unit count
          const totalBeds = prop.bedrooms || 0;
          const totalBaths = prop.bathrooms || 0;
          const bedsPerUnit =
            totalBeds > 0 && units > 1
              ? Math.max(1, Math.round(totalBeds / units))
              : totalBeds || 2;
          const bathsPerUnit =
            totalBaths > 0 && units > 1
              ? Math.max(1, Math.round(totalBaths / units))
              : totalBaths || 1;

          const initialUnits = Array.from({ length: units }, (_, i) => ({
            unitNumber: i + 1,
            bedrooms: String(bedsPerUnit),
            bathrooms: String(bathsPerUnit),
            monthlyRent:
              rentcastRentPerUnit > 0
                ? rentcastRentPerUnit.toString()
                : "",
            notes: "",
          }));
          setUnitRents(initialUnits);

          if (rentcastRentPerUnit > 0) {
            setMonthlyRent((rentcastRentPerUnit * units).toString());
          }
        } else {
          // Pre-populate monthly rent for single-family
          if (edited.estimatedRent) setMonthlyRent(edited.estimatedRent);
        }
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

  /* ---------- Load user subscription tier ------------------------ */

  useEffect(() => {
    const loadUserTier = async () => {
      try {
        const supabase = createClient();

        // Step 1: Get session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          setUserTier("free");
          setIsLoadingTier(false);
          return;
        }

        setUserId(session.user.id);
        setIsLoggedIn(true);

        // Step 2: Direct profile query — most reliable
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("subscription_tier, subscription_status")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error(
            "Tier lookup error:",
            profileError.message,
            "Code:",
            profileError.code
          );
          // Check subscriptions table as fallback
          const { data: sub, error: subError } = await supabase
            .from("subscriptions")
            .select("tier, status")
            .eq("user_id", session.user.id)
            .single();

          if (subError || !sub) {
            setUserTier("free");
            setIsLoadingTier(false);
            return;
          }

          // Map from subscriptions table
          const tier = sub.tier || "free";
          console.log("V2 tier loaded (subscriptions fallback):", tier, "→ mapped to:", mapToV2Tier(tier));
          setUserTier(mapToV2Tier(tier));
          setIsLoadingTier(false);
          return;
        }

        // Step 3: Map to V2 tier
        const tier = profile?.subscription_tier || "free";
        console.log("V2 tier loaded:", tier, "→ mapped to:", mapToV2Tier(tier));
        setUserTier(mapToV2Tier(tier));
        console.log("TIER SET:", {
          rawTier: tier,
          mappedTier: mapToV2Tier(tier),
          userId: session.user.id,
        });
      } catch (err: any) {
        console.error("loadUserTier unexpected error:", err);
        setUserTier("free");
      } finally {
        setIsLoadingTier(false);
      }
    };

    loadUserTier();
  }, []);

  /* ---------- Strategy defaults ---------------------------------- */

  useEffect(() => {
    if (!selectedStrategy) return;

    if (selectedStrategy === "Fix & Flip") {
      setLoanType("Hard Money");
      setDownPayment("10");
      setInterestRate("12");
      setLoanTerm("12");
      setPoints("2");
      setHoldingMonths("6");
      setClosingCosts("3");
      // Prefer comp-based ARV, fall back to AVM
      if (!afterRepairValue) {
        const arv = arvAnalysis?.arvEstimate || editedProperty.estimatedValue;
        if (arv) setAfterRepairValue(String(arv));
      }
    }

    if (selectedStrategy === "BRRRR") {
      setLoanType("Hard Money → DSCR Refi");
      setDownPayment("10");
      setInterestRate("12");
      setLoanTerm("12");
      setPoints("2");
      setHoldingMonths("6");
      setClosingCosts("3");
      if (!afterRepairValue) {
        const arv = arvAnalysis?.arvEstimate || editedProperty.estimatedValue;
        if (arv) setAfterRepairValue(String(arv));
      }
    }

    if (selectedStrategy === "Buy & Hold") {
      setLoanType("Conventional");
      setDownPayment("25");
      setInterestRate("7.5");
      setLoanTerm("30");
      setPoints("0");
      setClosingCosts("3");
      if (editedProperty.estimatedRent && !monthlyRent) {
        setMonthlyRent(editedProperty.estimatedRent);
      }
    }

    if (selectedStrategy === "House Hack") {
      setLoanType("FHA");
      setDownPayment("3.5");
      setInterestRate("7.25");
      setLoanTerm("30");
      setPoints("0");
      setClosingCosts("3.5");
      if (editedProperty.estimatedRent && !monthlyRent) {
        setMonthlyRent(editedProperty.estimatedRent);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStrategy]);

  /* ---------- Validate model for tier ----------------------------- */

  useEffect(() => {
    if (isLoadingTier) return;

    const isAllowed =
      requestedModel === "speed" ||
      (requestedModel === "balanced" &&
        (userTier === "pro" || userTier === "pro_max")) ||
      (requestedModel === "max" && userTier === "pro_max");

    if (isAllowed) {
      setSelectedModel(requestedModel);
    } else {
      if (userTier === "pro_max") setSelectedModel("max");
      else if (userTier === "pro") setSelectedModel("balanced");
      else setSelectedModel("speed");
    }
  }, [userTier, isLoadingTier, requestedModel]);

  /* ---------- Multifamily sync ------------------------------------ */

  useEffect(() => {
    if (unitCount <= 1) {
      setIsMultifamily(false);
      setUnitRents([]);
      return;
    }

    setIsMultifamily(true);

    setUnitRents((prev) => {
      if (unitCount > prev.length) {
        const newUnits = Array.from(
          { length: unitCount - prev.length },
          (_, i) => ({
            unitNumber: prev.length + i + 1,
            bedrooms: "2",
            bathrooms: "1",
            monthlyRent: prev[0]?.monthlyRent || "",
            notes: "",
          })
        );
        return [...prev, ...newUnits];
      } else {
        return prev.slice(0, unitCount);
      }
    });
  }, [unitCount]);

  useEffect(() => {
    if (!isMultifamily || unitRents.length === 0) return;

    const total = unitRents.reduce((sum, unit) => {
      return sum + (parseFloat(unit.monthlyRent) || 0);
    }, 0);

    if (total > 0) {
      setMonthlyRent(total.toString());
    }
  }, [unitRents, isMultifamily]);

  /* ---------- Update edited property helper ---------------------- */

  function updateEdited(field: keyof EditedProperty, value: string) {
    setEditedProperty((prev) => ({ ...prev, [field]: value }));
  }

  /* ---------- V2 JSON parser -------------------------------------- */

  const parseAnalysisStream = (raw: string): AnalysisResult | null => {
    if (!raw || raw.trim().length === 0) return null;

    const trimmed = raw.trim();

    // Strategy 1: Aggressive clean then parse
    try {
      let cleaned = raw;

      // Remove BOM if present
      if (cleaned.charCodeAt(0) === 0xfeff) {
        cleaned = cleaned.slice(1);
      }

      // Trim all whitespace including \n \r \t
      cleaned = cleaned.trim();

      // Find the actual JSON boundaries
      const firstBrace = cleaned.indexOf("{");
      const lastBrace = cleaned.lastIndexOf("}");

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const jsonStr = cleaned.slice(firstBrace, lastBrace + 1);
        const parsed = JSON.parse(jsonStr);
        if (parsed && typeof parsed === "object") {
          // Unwrap if nested
          if (parsed.analysis && typeof parsed.analysis === "object") {
            return parsed.analysis;
          }
          return parsed;
        }
      }
    } catch (e1) {
      console.log("Strategy 1 failed:", (e1 as Error).message);
    }

    // Strategy 2: Strip markdown fences
    try {
      const stripped = trimmed
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      const parsed = JSON.parse(stripped);
      if (parsed && typeof parsed === "object") return parsed;
    } catch (e2) {
      console.log("Strategy 2 failed:", (e2 as Error).message);
    }

    // Strategy 3: Find JSON object by braces
    try {
      const start = trimmed.indexOf("{");
      const end = trimmed.lastIndexOf("}");
      if (start !== -1 && end !== -1 && end > start) {
        const extracted = trimmed.slice(start, end + 1);
        const parsed = JSON.parse(extracted);
        if (parsed && typeof parsed === "object") return parsed;
      }
    } catch (e3) {
      console.log("Strategy 3 failed:", (e3 as Error).message);
    }

    // Log exactly why all strategies failed
    console.error("All strategies failed");
    console.error("Raw type:", typeof raw);
    console.error("Raw length:", raw.length);
    console.error(
      "Char codes first 5:",
      Array.from(raw.substring(0, 5)).map((c) => c.charCodeAt(0))
    );
    console.error("Trimmed first 100:", trimmed.substring(0, 100));

    return null;
  };

  /* ---------- Normalize result (handle camelCase + snake_case) ---- */

  function normalizeResult(raw: any): AnalysisResult {
    return {
      ...raw,
      dealScore: raw.dealScore ?? raw.deal_score,
      strategyType: raw.strategyType ?? raw.strategy_type,
      metrics: raw.metrics
        ? {
            ...raw.metrics,
            capRate: raw.metrics.capRate ?? raw.metrics.cap_rate,
            cashOnCash: raw.metrics.cashOnCash ?? raw.metrics.cash_on_cash,
            arvEstimate: raw.metrics.arvEstimate ?? raw.metrics.arv_estimate,
            equityCapture: raw.metrics.equityCapture ?? raw.metrics.equity_capture,
            monthlyRent: raw.metrics.monthlyRent ?? raw.metrics.monthly_rent,
          }
        : raw.metrics,
      cashFlow: raw.cashFlow ?? raw.cash_flow,
      proForma: raw.proForma ?? raw.pro_forma,
      riskFlags: raw.riskFlags ?? raw.risk_flags,
      marketContext: raw.marketContext ?? raw.market_context,
    };
  }

  /* ---------- API call ------------------------------------------- */

  async function handleAnalyze() {
    console.log("HANDLE ANALYZE CALLED:", {
      userTier,
      isProMax: userTier === "pro_max",
      selectedStrategy,
    });
    if (!selectedStrategy || !purchasePrice) return;

    setIsAnalyzing(true);
    setStreamText("");
    setAnalysisError("");
    setHasAnalyzed(true);
    setParsedResult(null);
    setProgressSteps([]);
    setCurrentStep("");

    // Use monthlyRent from state, or fall back to edited rent estimate
    const effectiveRent = monthlyRent || editedProperty.estimatedRent;

    // Pro Max parallel — only when user selected Max IQ model
    if (userTier === "pro_max" && selectedModel === "max") {
      setProMaxMode(true);
      resetProMaxResults();

      const fetchBody = {
        address,
        strategy: apiStrategy,
        purchasePrice: parseFloat(purchasePrice) || 0,
        downPayment:
          (parseFloat(purchasePrice) || 0) *
          ((parseFloat(downPayment) || 20) / 100),
        loanTerms: {
          interestRate: parseFloat(interestRate) || 7.5,
          loanTerm: parseFloat(loanTerm) || 30,
          loanType:
            loanType.includes("Hard Money") || loanType.includes("Private Money")
              ? "hardMoney"
              : "conventional",
          points: parseFloat(points) || 0,
        },
        rehabCosts: rehabCost ? parseFloat(rehabCost) : undefined,
        arv: afterRepairValue ? parseFloat(afterRepairValue) : undefined,
        holdingPeriod: holdingMonths ? parseFloat(holdingMonths) : undefined,
        strategyDetails: {
          timeline: holdingMonths || undefined,
          exitStrategy: selectedStrategy === "BRRRR" ? "75" : undefined,
          downPaymentPercent: parseFloat(downPayment) || undefined,
        },
        closingCostsPercent: parseFloat(closingCosts) || 3,
        units: unitCount,
        monthlyRent: effectiveRent ? parseFloat(effectiveRent) : undefined,
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
        ...(isMultifamily && unitRents.length > 0
          ? {
              unitBreakdown: unitRents.map((u) => ({
                unitNumber: u.unitNumber,
                bedrooms: parseFloat(u.bedrooms) || 2,
                bathrooms: parseFloat(u.bathrooms) || 1,
                monthlyRent: parseFloat(u.monthlyRent) || 0,
                notes: u.notes,
              })),
            }
          : {}),
      };

      try {
        await runParallelAnalysis(fetchBody, parseAnalysisStream, normalizeResult);
      } catch (err: any) {
        setAnalysisError(err.message || "Parallel analysis failed");
        setHasAnalyzed(false);
      } finally {
        setIsAnalyzing(false);
      }
      return;
    }

    // Standard single-model flow (free / pro)
    setProMaxMode(false);

    try {
      const response = await fetch("/api/analysis/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-V2-Request": "true" },
        body: JSON.stringify({
          address,
          strategy: apiStrategy,
          purchasePrice: parseFloat(purchasePrice) || 0,
          downPayment:
            (parseFloat(purchasePrice) || 0) *
            ((parseFloat(downPayment) || 20) / 100),
          loanTerms: {
            interestRate: parseFloat(interestRate) || 7.5,
            loanTerm: parseFloat(loanTerm) || 30,
            loanType:
              loanType.includes("Hard Money") || loanType.includes("Private Money")
                ? "hardMoney"
                : "conventional",
            points: parseFloat(points) || 0,
          },
          rehabCosts: rehabCost ? parseFloat(rehabCost) : undefined,
          arv: afterRepairValue ? parseFloat(afterRepairValue) : undefined,
          holdingPeriod: holdingMonths ? parseFloat(holdingMonths) : undefined,
          strategyDetails: {
            timeline: holdingMonths || undefined,
            exitStrategy: selectedStrategy === "BRRRR" ? "75" : undefined,
            downPaymentPercent: parseFloat(downPayment) || undefined,
          },
          closingCostsPercent: parseFloat(closingCosts) || 3,
          units: unitCount,
          monthlyRent: effectiveRent ? parseFloat(effectiveRent) : undefined,
          ...(isMultifamily && unitRents.length > 0
            ? {
                unitBreakdown: unitRents.map((u) => ({
                  unitNumber: u.unitNumber,
                  bedrooms: parseFloat(u.bedrooms) || 2,
                  bathrooms: parseFloat(u.bathrooms) || 1,
                  monthlyRent: parseFloat(u.monthlyRent) || 0,
                  notes: u.notes,
                })),
              }
            : {}),
          // V2 — pass full RentCast data + user-edited overrides
          propertyData: propertyData
            ? {
                ...propertyData,
                property: {
                  ...(propertyData.property || {}),
                  bedrooms:
                    parseFloat(editedProperty.beds) ||
                    propertyData.property?.bedrooms,
                  bathrooms:
                    parseFloat(editedProperty.baths) ||
                    propertyData.property?.bathrooms,
                  squareFootage:
                    parseFloat(editedProperty.sqft) ||
                    propertyData.property?.squareFootage,
                  yearBuilt:
                    parseFloat(editedProperty.yearBuilt) ||
                    propertyData.property?.yearBuilt,
                  propertyType:
                    editedProperty.propertyType ||
                    propertyData.property?.propertyType,
                },
                rental: {
                  ...(propertyData.rental || {}),
                  rentEstimate:
                    parseFloat(editedProperty.estimatedRent) ||
                    propertyData.rental?.rentEstimate,
                },
                comparables: {
                  ...(propertyData.comparables || {}),
                  value:
                    parseFloat(editedProperty.estimatedValue) ||
                    propertyData.comparables?.value,
                },
              }
            : undefined,
          // Model override for speed selection by pro/pro_max users
          ...(selectedModel === "speed" ? { modelOverride: "gpt-4o-mini" } : {}),
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Analysis failed");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response stream");

      let rawBuffer = "";
      let lineBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        rawBuffer += chunk;
        lineBuffer += chunk;

        // Process complete lines in real time for progress events only
        const lines = lineBuffer.split("\n");
        lineBuffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("PROGRESS:")) {
            try {
              const event = JSON.parse(line.slice(9));
              if (event.type === "progress") {
                setProgressSteps((prev) => [
                  ...prev,
                  {
                    step: event.step,
                    detail: event.detail,
                    timestamp: Date.now(),
                  },
                ]);
                setCurrentStep(event.step);
              }
            } catch {}
          } else if (line.startsWith("MODEL:")) {
            try {
              const info = JSON.parse(line.slice(6));
              setModelInfo(info);
              setProgressSteps((prev) => [
                ...prev,
                {
                  step: "model",
                  detail: `Running analysis with ${info.modelLabel}`,
                  timestamp: Date.now(),
                },
              ]);
              setCurrentStep("model");
            } catch {}
          }
          // Don't process RESULT or CALCULATIONS here —
          // wait for complete buffer after stream ends
        }
      }

      // Stream complete — process the full buffer
      // for RESULT and CALCULATIONS which may be split across chunks
      const allLines = rawBuffer.split("\n");
      let fullResultJson = "";

      for (const line of allLines) {
        if (line.startsWith("CALCULATIONS:")) {
          try {
            const calc = JSON.parse(line.slice(13));
            setServerCalculations(calc);
          } catch {}
        } else if (line.startsWith("RESULT:")) {
          fullResultJson = line.slice(7);
        } else if (line.startsWith("ERROR:")) {
          try {
            const err = JSON.parse(line.slice(6));
            if (err.code === "RATE_LIMITED") {
              const minutes = err.retryAfter
                ? Math.ceil(err.retryAfter / 60)
                : 60;
              throw new Error(
                `Rate limit reached. Please wait ${minutes} minute${minutes === 1 ? "" : "s"} before running another analysis.`
              );
            }
            throw new Error(err.message || "Analysis failed");
          } catch (parseErr) {
            if (
              parseErr instanceof Error &&
              parseErr.message.includes("Rate limit")
            ) {
              throw parseErr;
            }
            throw new Error("Analysis failed");
          }
        } else if (
          fullResultJson &&
          line.trim() &&
          !line.startsWith("PROGRESS:") &&
          !line.startsWith("MODEL:") &&
          !line.startsWith("CALCULATIONS:") &&
          !line.startsWith("ERROR:")
        ) {
          // Continuation of the JSON result split across lines
          fullResultJson += line;
        }
      }

      // Last resort extraction if RESULT line was split across chunks
      if (!fullResultJson || fullResultJson.length < 10) {
        const resultMarker = rawBuffer.indexOf("RESULT:");
        if (resultMarker !== -1) {
          const afterResult = rawBuffer.slice(resultMarker + 7);
          const lastBrace = afterResult.lastIndexOf("}");
          if (lastBrace !== -1) {
            fullResultJson = afterResult.slice(0, lastBrace + 1);
          }
        }
      }

      setStreamText(fullResultJson);

      console.log("V2 Analysis Debug:", {
        rawBufferLength: rawBuffer.length,
        fullResultJsonLength: fullResultJson.length,
        firstResultChars: fullResultJson.substring(0, 100),
      });

      if (fullResultJson) {
        const parsed = parseAnalysisStream(fullResultJson);
        if (parsed) {
          console.log(
            "V2 parsed successfully, dealScore:",
            parsed.dealScore
          );
          setParsedResult(normalizeResult(parsed));
        } else {
          console.warn("parseAnalysisStream returned null");
          console.log("Raw result:", fullResultJson);
        }
      } else {
        console.error("No RESULT line found in stream");
        console.log("Full buffer preview:", rawBuffer.substring(0, 500));
      }
    } catch (err: any) {
      setAnalysisError(err.message || "Unknown error");
      setHasAnalyzed(false);
    } finally {
      setIsAnalyzing(false);
    }
  }

  // Derived values for results are now inside AnalysisResults component
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
        @keyframes v2-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes v2-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .v2-progress-step {
          animation: v2-step-in 0.3s ease forwards;
        }
        @keyframes v2-step-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .v2-input:focus {
          border-color: rgba(127,119,221,0.5) !important;
          outline: none;
        }
        @media (max-width: 768px) {
          .property-grid-4 {
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
          }
          .property-grid-3 {
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
          }
          .strategy-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .inputs-row {
            flex-direction: column !important;
          }
          .deal-params-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
          }
          .rent-roll-table {
            grid-template-columns: 40px 60px 60px 1fr 90px !important;
            font-size: 12px !important;
          }
          .rent-roll-table input {
            font-size: 12px !important;
            padding: 3px 4px !important;
          }
          .analyze-main {
            padding: 24px 16px 48px !important;
          }
          .analyze-back-row {
            margin-bottom: 16px !important;
          }
          .analyze-header h1 {
            font-size: 18px !important;
            letter-spacing: -0.3px !important;
          }
          .quick-inputs-row {
            flex-direction: column !important;
            gap: 10px !important;
          }
        }
        @media (max-width: 390px) {
          .property-grid-4 {
            grid-template-columns: 1fr !important;
          }
          .rent-roll-table {
            grid-template-columns: 36px 50px 50px 1fr 80px !important;
          }
        }
      `}</style>

      <NavBar />

      <main
        className="analyze-main mx-auto w-full"
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

        {!isLoadingTier && (
          <span
            suppressHydrationWarning
            className="mt-1.5 inline-flex items-center gap-1.5"
            style={{
              background: "rgba(83,74,183,0.15)",
              border: "0.5px solid rgba(127,119,221,0.3)",
              color: "#9994b8",
              borderRadius: 6,
              padding: "3px 10px",
              fontSize: 11,
            }}
          >
            {modelInfo
              ? modelInfo.modelLabel
              : selectedModel === "max"
                ? "Max IQ \u2014 Opus \u00B7 GPT-4o \u00B7 Grok 3"
                : selectedModel === "balanced"
                  ? "Balanced (Auto-routed)"
                  : "GPT-4o-mini (Speed)"}
          </span>
        )}

        {!isLoadingTier && userTier === "pro" && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: "rgba(83,74,183,0.15)",
              border: "0.5px solid rgba(127,119,221,0.3)",
              borderRadius: 6,
              padding: "3px 10px",
              fontSize: 11,
              color: "#9994b8",
              marginTop: 6,
              marginLeft: 6,
            }}
          >
            Pro — Balanced model
          </span>
        )}

        {!isLoadingTier && userTier === "pro_max" && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: "rgba(83,74,183,0.15)",
              border: "0.5px solid rgba(127,119,221,0.5)",
              borderRadius: 6,
              padding: "3px 10px",
              fontSize: 11,
              color: "#c0baf0",
              marginTop: 6,
              marginLeft: 6,
            }}
          >
            Pro Max — Max IQ model
          </span>
        )}

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
                  className="grid property-grid-4"
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
                  className="grid property-grid-3"
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

                {/* ARV Analysis card */}
                {arvAnalysis && arvAnalysis.arvEstimate && (
                  <div
                    style={{
                      background: "rgba(127,119,221,0.05)",
                      border: "0.5px solid rgba(127,119,221,0.15)",
                      borderRadius: 10,
                      padding: "14px 16px",
                      marginTop: 14,
                      marginBottom: 14,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span style={fieldLabelStyle}>Comp-Based ARV</span>
                      <span
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: "#f0eeff",
                        }}
                      >
                        $
                        {arvAnalysis.arvEstimate.toLocaleString("en-US")}
                      </span>
                    </div>
                    <div
                      className="flex items-center justify-between"
                      style={{ marginTop: 8 }}
                    >
                      <span style={{ fontSize: 12, color: "#4e4a6a" }}>
                        {arvAnalysis.note}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          borderRadius: 4,
                          padding: "2px 8px",
                          background:
                            arvAnalysis.confidence === "high"
                              ? "rgba(29,158,117,0.15)"
                              : arvAnalysis.confidence === "medium"
                                ? "rgba(186,117,23,0.15)"
                                : "rgba(162,45,45,0.15)",
                          color:
                            arvAnalysis.confidence === "high"
                              ? "#1D9E75"
                              : arvAnalysis.confidence === "medium"
                                ? "#EF9F27"
                                : "#f09595",
                        }}
                      >
                        {arvAnalysis.confidence} confidence
                      </span>
                    </div>
                    {arvAnalysis.pricePerSqft && (
                      <p
                        style={{
                          fontSize: 11,
                          color: "#3a3758",
                          marginTop: 6,
                        }}
                      >
                        ${arvAnalysis.pricePerSqft}/sqft avg
                        {arvAnalysis.avm
                          ? ` · AVM: $${arvAnalysis.avm.toLocaleString("en-US")}`
                          : ""}
                      </p>
                    )}
                  </div>
                )}

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
              className="grid strategy-grid"
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

        {/* SECTION 3 — Strategy-aware deal parameters */}
        {selectedStrategy && !hasAnalyzed && (() => {
          const isCash = loanType === "Cash" || loanType === "Cash → DSCR Refi";
          const isFlip = selectedStrategy === "Fix & Flip";
          const isBRRRR = selectedStrategy === "BRRRR";
          const isBuyHold = selectedStrategy === "Buy & Hold";
          const isHouseHack = selectedStrategy === "House Hack";
          const showRehabRow = isFlip || isBRRRR;
          const showRentalRow = isBuyHold || isHouseHack;

          const loanPills: Record<string, string[]> = {
            "Fix & Flip": ["Hard Money", "Private Money", "Cash"],
            BRRRR: ["Hard Money → DSCR Refi", "Private Money → DSCR Refi", "Cash → DSCR Refi"],
            "Buy & Hold": ["Conventional", "DSCR Loan", "Portfolio Loan", "Cash"],
            "House Hack": ["FHA", "Conventional", "VA Loan"],
          };

          const dpHelper: Record<string, string> = {
            "Hard Money": "10% typical for hard money",
            "Private Money": "10-15% typical",
            FHA: "3.5% minimum for FHA",
            Conventional: "20-25% for investment property",
            "DSCR Loan": "20-25% minimum",
            "VA Loan": "0% for VA eligible",
          };

          const rateHelper: Record<string, string> = {
            "Hard Money": "10-14% typical range",
            "Private Money": "8-12% typical range",
            FHA: "7-8% current market",
            Conventional: "7-8% current market",
            "DSCR Loan": "7.5-9% typical range",
            "VA Loan": "6.5-7.5% current market",
          };

          const maxOffer =
            afterRepairValue && rehabCost
              ? parseFloat(afterRepairValue) * 0.85 - parseFloat(rehabCost)
              : null;
          const refiProceeds = afterRepairValue
            ? parseFloat(afterRepairValue) * 0.75
            : null;
          const closingDollar =
            purchasePrice && closingCosts
              ? Math.round(
                  parseFloat(purchasePrice) *
                    (parseFloat(closingCosts) / 100)
                )
              : null;

          const inp = (
            label: string,
            value: string,
            onChange: (v: string) => void,
            opts?: {
              placeholder?: string;
              step?: string;
              helper?: string;
              extra?: React.ReactNode;
            }
          ) => (
            <div className="flex-1">
              <label style={fieldLabelStyle}>{label}</label>
              <input
                type="number"
                step={opts?.step}
                placeholder={opts?.placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
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
              {opts?.helper && (
                <span style={{ fontSize: 10, color: "#3a3758", marginTop: 4, display: "block" }}>
                  {opts.helper}
                </span>
              )}
              {opts?.extra}
            </div>
          );

          return (
            <div style={{ marginTop: 20, marginBottom: 8 }}>
              <p
                className="uppercase"
                style={{
                  fontSize: 11,
                  letterSpacing: "1px",
                  color: "#3a3758",
                  marginBottom: 14,
                }}
              >
                Deal Parameters
              </p>

              {/* Loan type pills */}
              <div className="mb-4 flex flex-wrap gap-2">
                {(loanPills[selectedStrategy] || []).map((lt) => {
                  const active = loanType === lt;
                  return (
                    <button
                      key={lt}
                      onClick={() => setLoanType(lt)}
                      className="cursor-pointer transition-colors"
                      style={{
                        background: active ? "rgba(83,74,183,0.25)" : "transparent",
                        color: active ? "#c0baf0" : "#4e4a6a",
                        border: active
                          ? "0.5px solid rgba(127,119,221,0.5)"
                          : "0.5px solid rgba(127,119,221,0.1)",
                        borderRadius: 6,
                        padding: "5px 14px",
                        fontSize: 12,
                      }}
                    >
                      {lt}
                    </button>
                  );
                })}
              </div>

              {/* Row 1 — core financing */}
              <div className="mb-3 flex gap-3">
                {inp("Purchase Price", purchasePrice, setPurchasePrice, {
                  placeholder: editedProperty.listPrice || editedProperty.estimatedValue || "e.g. 450000",
                  helper:
                    !purchasePrice && !editedProperty.listPrice && editedProperty.estimatedValue
                      ? `RentCast AVM: $${parseFloat(editedProperty.estimatedValue).toLocaleString()} — reference only`
                      : !purchasePrice && !editedProperty.listPrice
                        ? "No active listing found. Enter your target price."
                        : undefined,
                })}
                {inp("Down Payment %", downPayment, setDownPayment, {
                  helper: dpHelper[loanType] || dpHelper[loanType.split(" ")[0]] || "",
                })}
                {inp("Interest Rate %", interestRate, setInterestRate, {
                  step: "0.1",
                  helper: rateHelper[loanType] || rateHelper[loanType.split(" ")[0]] || "",
                })}
                {!isCash && !loanType.includes("→") && (
                  inp("Loan Term (years)", loanTerm, setLoanTerm)
                )}
              </div>

              {/* Row 2 — strategy-specific */}
              {showRehabRow && (
                <div className="mb-3 flex gap-3">
                  {inp("Rehab Budget", rehabCost, setRehabCost, {
                    placeholder: "Estimated repair costs",
                  })}
                  {inp("After Repair Value (ARV)", afterRepairValue, setAfterRepairValue, {
                    placeholder: editedProperty.estimatedValue || "ARV estimate",
                    helper: isFlip ? "Max purchase = ARV × 85% − rehab" : "Refi target: ARV × 75% LTV",
                    extra: isFlip && maxOffer != null ? (
                      <span style={{
                        fontSize: 11,
                        color: purchasePrice && parseFloat(purchasePrice) <= maxOffer ? "#1D9E75" : "#f09595",
                        marginTop: 2,
                        display: "block",
                      }}>
                        Max allowable offer: ${maxOffer.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </span>
                    ) : isBRRRR && refiProceeds != null ? (
                      <span style={{ fontSize: 11, color: "#7F77DD", marginTop: 2, display: "block" }}>
                        Est. refi proceeds: ${refiProceeds.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </span>
                    ) : undefined,
                  })}
                  {inp("Holding Period (months)", holdingMonths, setHoldingMonths, {
                    placeholder: "6",
                  })}
                  {inp("Loan Points", points, setPoints, {
                    step: "0.5",
                    placeholder: "2",
                  })}
                </div>
              )}

              {showRentalRow && (
                <>
                  {/* Unit count + rent inputs */}
                  <div className="mb-3 flex gap-3">
                    {/* Unit count */}
                    <div style={{ width: 100, flexShrink: 0 }}>
                      <label style={fieldLabelStyle}>Units</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={unitCount}
                        onChange={(e) =>
                          setUnitCount(parseInt(e.target.value) || 1)
                        }
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

                    {/* Single rent input (when not multifamily) */}
                    {!isMultifamily && (
                      <>
                        {inp(
                          isHouseHack
                            ? "Total Rental Income / Mo"
                            : "Est. Monthly Rent",
                          monthlyRent,
                          setMonthlyRent,
                          {
                            placeholder:
                              editedProperty.estimatedRent || "e.g. 2800",
                            helper: isHouseHack
                              ? "Income from rented units/rooms"
                              : undefined,
                          }
                        )}
                      </>
                    )}

                    {/* Total rent display (when multifamily) */}
                    {isMultifamily && (
                      <div className="flex-1">
                        <label style={fieldLabelStyle}>
                          Total Monthly Rent
                        </label>
                        <div
                          style={{
                            background: "#13121d",
                            border: "0.5px solid rgba(127,119,221,0.2)",
                            borderRadius: 8,
                            padding: "10px 14px",
                            color: parseFloat(monthlyRent) > 0
                              ? "#1D9E75"
                              : "#4e4a6a",
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          ${(parseFloat(monthlyRent) || 0).toLocaleString()}
                          /mo
                        </div>
                        <span
                          style={{
                            fontSize: 10,
                            color: "#3a3758",
                            marginTop: 4,
                            display: "block",
                          }}
                        >
                          Sum of rent roll below
                        </span>
                      </div>
                    )}

                    {inp("Property Tax / Year", propertyTax, setPropertyTax, {
                      placeholder: "e.g. 6000",
                    })}
                    {inp("Insurance / Year", insurance, setInsurance, {
                      placeholder: "e.g. 1800",
                    })}
                  </div>

                  {/* Rent Roll table */}
                  {isMultifamily && unitRents.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 8,
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
                          Rent Roll
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color:
                              parseFloat(monthlyRent) > 0
                                ? "#1D9E75"
                                : "#4e4a6a",
                          }}
                        >
                          Total: $
                          {(parseFloat(monthlyRent) || 0).toLocaleString()}
                          /mo
                        </span>
                      </div>

                      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', margin: '0 -4px', padding: '0 4px' }}>
                      <div
                        style={{
                          background: "#0d0d14",
                          border: "0.5px solid rgba(127,119,221,0.15)",
                          borderRadius: 10,
                          overflow: "hidden",
                        }}
                      >
                        {/* Header */}
                        <div
                          className="rent-roll-table"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "48px 64px 64px 1fr 110px",
                            gap: 8,
                            padding: "8px 14px",
                            background: "rgba(127,119,221,0.06)",
                            fontSize: 10,
                            textTransform: "uppercase",
                            letterSpacing: "0.6px",
                            color: "#3a3758",
                          }}
                        >
                          <span>Unit</span>
                          <span>Beds</span>
                          <span>Baths</span>
                          <span>Notes</span>
                          <span style={{ textAlign: "right" }}>Rent/Mo</span>
                        </div>

                        {/* Rows */}
                        {unitRents.map((unit, idx) => {
                          const cellInput: React.CSSProperties = {
                            background: "transparent",
                            border: "none",
                            borderBottom:
                              "0.5px solid rgba(127,119,221,0.2)",
                            borderRadius: 0,
                            padding: "4px 6px",
                            color: "#e8e6f0",
                            fontSize: 13,
                            width: "100%",
                            outline: "none",
                            fontFamily: "inherit",
                          };

                          const updateUnit = (
                            field: string,
                            value: string
                          ) => {
                            setUnitRents((prev) =>
                              prev.map((u, i) =>
                                i === idx
                                  ? { ...u, [field]: value }
                                  : u
                              )
                            );
                          };

                          return (
                            <div
                              key={idx}
                              className="rent-roll-table"
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "48px 64px 64px 1fr 110px",
                                gap: 8,
                                padding: "10px 14px",
                                alignItems: "center",
                                borderTop:
                                  idx > 0
                                    ? "0.5px solid rgba(127,119,221,0.08)"
                                    : "none",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 12,
                                  color: "#4e4a6a",
                                }}
                              >
                                Unit {unit.unitNumber}
                              </span>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                step="1"
                                value={unit.bedrooms}
                                onChange={(e) =>
                                  updateUnit("bedrooms", e.target.value)
                                }
                                placeholder="2"
                                style={cellInput}
                              />
                              <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.5"
                                value={unit.bathrooms}
                                onChange={(e) =>
                                  updateUnit("bathrooms", e.target.value)
                                }
                                placeholder="1"
                                style={cellInput}
                              />
                              <input
                                type="text"
                                value={unit.notes}
                                onChange={(e) =>
                                  updateUnit("notes", e.target.value)
                                }
                                placeholder="e.g. renovated, corner unit"
                                style={cellInput}
                              />
                              <div style={{ position: "relative" }}>
                                <span
                                  style={{
                                    position: "absolute",
                                    left: 6,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "#4e4a6a",
                                    fontSize: 13,
                                    pointerEvents: "none",
                                  }}
                                >
                                  $
                                </span>
                                <input
                                  type="number"
                                  value={unit.monthlyRent}
                                  onChange={(e) =>
                                    updateUnit(
                                      "monthlyRent",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0"
                                  style={{
                                    ...cellInput,
                                    paddingLeft: 18,
                                    fontWeight: 600,
                                    textAlign: "right",
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      </div>

                      {/* Apply to all button */}
                      {unitRents.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const firstRent =
                              unitRents[0]?.monthlyRent || "";
                            setUnitRents((prev) =>
                              prev.map((u) => ({
                                ...u,
                                monthlyRent: firstRent,
                              }))
                            );
                          }}
                          style={{
                            fontSize: 12,
                            color: "#534AB7",
                            cursor: "pointer",
                            background: "transparent",
                            border: "none",
                            padding: "6px 0",
                            fontFamily: "inherit",
                          }}
                        >
                          &uarr;&darr; Apply Unit 1 rent to all units
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Closing costs row */}
              {!isCash && (
                <div className="flex gap-3" style={{ maxWidth: 300 }}>
                  {inp("Closing Costs %", closingCosts, setClosingCosts, {
                    step: "0.5",
                    helper: "Typically 3-4% of purchase price",
                    extra: closingDollar != null ? (
                      <span style={{ fontSize: 12, color: "#4e4a6a", marginTop: 2, display: "block" }}>
                        ≈ ${closingDollar.toLocaleString("en-US")}
                      </span>
                    ) : undefined,
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* SECTION 4 — Analyze button */}
        {selectedStrategy && !hasAnalyzed && (
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !purchasePrice || purchasePrice === "0"}
            title={
              !purchasePrice || purchasePrice === "0"
                ? "Enter a purchase price to run analysis"
                : undefined
            }
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
              opacity: isAnalyzing || !purchasePrice || purchasePrice === "0" ? 0.4 : 1,
              cursor: isAnalyzing || !purchasePrice || purchasePrice === "0" ? "not-allowed" : "pointer",
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

        {/* SECTION 5 — Thinking UI */}
        {isAnalyzing && (
          <div style={{ marginTop: 32, maxWidth: 600 }}>
            {/* Header */}
            <div className="mb-5 flex items-center gap-3">
              <div
                className="relative flex shrink-0 items-center justify-center"
                style={{ width: 32, height: 32 }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: "1.5px solid rgba(127,119,221,0.3)",
                    animation: "v2-spin 2s linear infinite",
                  }}
                />
                <div
                  style={{
                    width: 10,
                    height: 10,
                    background: "#7F77DD",
                    borderRadius: "50%",
                  }}
                />
              </div>
              <div>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#e8e6f0",
                    margin: 0,
                  }}
                >
                  Analyzing property...
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: "#4e4a6a",
                    marginTop: 2,
                  }}
                >
                  {address}
                </p>
              </div>
            </div>

            {/* Progress feed */}
            {progressSteps.map((ps, i) => {
              const isLast = i === progressSteps.length - 1;
              const iconColor = (() => {
                if (["rent", "arv", "cashflow", "househack"].includes(ps.step))
                  return "#1D9E75";
                if (ps.step === "rehab") return "#EF9F27";
                return "#534AB7";
              })();

              return (
                <div
                  key={`${ps.step}-${ps.timestamp}`}
                  className="v2-progress-step flex items-start gap-3"
                  style={{
                    padding: "10px 0",
                    borderBottom:
                      "0.5px solid rgba(127,119,221,0.06)",
                  }}
                >
                  <div
                    className="flex shrink-0 items-center justify-center"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: "rgba(83,74,183,0.1)",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={iconColor}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {ps.step === "auth" && (
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      )}
                      {(ps.step === "property" || ps.step === "househack") && (
                        <>
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          <polyline points="9 22 9 12 15 12 15 22" />
                        </>
                      )}
                      {ps.step === "avm" && (
                        <>
                          <line x1="18" y1="20" x2="18" y2="10" />
                          <line x1="12" y1="20" x2="12" y2="4" />
                          <line x1="6" y1="20" x2="6" y2="14" />
                        </>
                      )}
                      {(ps.step === "rent" || ps.step === "cashflow") && (
                        <>
                          <line x1="12" y1="1" x2="12" y2="23" />
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </>
                      )}
                      {ps.step === "comps" && (
                        <>
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </>
                      )}
                      {ps.step === "arv" && (
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      )}
                      {ps.step === "rehab" && (
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                      )}
                      {ps.step === "brrrr" && (
                        <>
                          <polyline points="1 4 1 10 7 10" />
                          <polyline points="23 20 23 14 17 14" />
                          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                        </>
                      )}
                      {ps.step === "model" && (
                        <>
                          <rect x="2" y="2" width="8" height="8" rx="2" />
                          <rect x="14" y="2" width="8" height="8" rx="2" />
                          <rect x="2" y="14" width="8" height="8" rx="2" />
                          <path d="M14 18h8M18 14v8" />
                        </>
                      )}
                      {(ps.step === "ai" || ps.step === "save") && (
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      )}
                    </svg>
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: 13,
                        color: "#9994b8",
                        lineHeight: 1.5,
                      }}
                    >
                      {ps.detail}
                      {isLast && currentStep === ps.step && (
                        <span
                          style={{
                            marginLeft: 2,
                            animation:
                              "v2-blink 1s infinite",
                          }}
                        >
                          |
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Status message */}
            <p
              style={{
                fontSize: 12,
                color: "#3a3758",
                textAlign: "center",
                marginTop: 16,
              }}
            >
              {progressSteps.length <= 2
                ? "Gathering property data..."
                : progressSteps.length <= 4
                  ? "Running financial calculations..."
                  : "AI is synthesizing your analysis..."}
            </p>
          </div>
        )}

        {/* SECTION 6 — Pro Max comparison / expanded view */}
        {proMaxMode ? (
          <ProMaxComparisonView
            modelResults={modelResults}
            completedCount={completedCount}
            totalModels={totalModels}
            PRO_MAX_MODELS={PRO_MAX_MODELS}
            expandedModel={expandedModel}
            setExpandedModel={setExpandedModel}
            selectedStrategy={selectedStrategy}
            address={address}
            editedProperty={editedProperty}
            userTier={userTier}
          />
        ) : null}

        {/* SECTION 6 — Results (standard single-model) */}
        {!proMaxMode && !isAnalyzing && parsedResult && (
          <div className="mt-8">
            {/* Results header */}
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
                onClick={() => router.push("/v2/dashboard")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#9994b8";
                  e.currentTarget.style.borderColor = "rgba(127,119,221,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#6b6690";
                  e.currentTarget.style.borderColor = "rgba(127,119,221,0.25)";
                }}
              >
                Run another analysis
              </button>
            </div>

            <AnalysisResults
              result={parsedResult}
              strategy={selectedStrategy}
              address={address}
              propertyData={editedProperty}
              calculations={serverCalculations}
              tier={userTier}
              model={modelInfo?.modelLabel || "AI Analysis"}
            />

            {/* Sign-in nudge for free/anonymous users */}
            {!isLoggedIn && userTier === "free" && !isLoadingTier && (
              <div
                style={{
                  marginTop: 24,
                  padding: "16px 20px",
                  background: "rgba(83,74,183,0.08)",
                  border: "0.5px solid rgba(127,119,221,0.2)",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#e8e6f0",
                      fontWeight: 500,
                      marginBottom: 3,
                    }}
                  >
                    Save this analysis and unlock full results
                  </div>
                  <div style={{ fontSize: 12, color: "#4e4a6a" }}>
                    Create a free account to save your history. Upgrade to
                    Pro to remove the blur and unlock projections.
                  </div>
                </div>
                <div
                  style={{ display: "flex", gap: 8, flexShrink: 0 }}
                >
                  <button
                    onClick={() =>
                      (window.location.href = "/v2/signup")
                    }
                    style={{
                      background: "#534AB7",
                      color: "#f0eeff",
                      border: "none",
                      borderRadius: 8,
                      padding: "8px 18px",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Create free account →
                  </button>
                  <button
                    onClick={() =>
                      (window.location.href = "/v2/login")
                    }
                    style={{
                      background: "transparent",
                      color: "#9994b8",
                      border: "0.5px solid rgba(127,119,221,0.25)",
                      borderRadius: 8,
                      padding: "8px 18px",
                      fontSize: 13,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Sign in
                  </button>
                </div>
              </div>
            )}
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
                onClick={() => router.push("/v2/dashboard")}
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
          analysisError.includes("Rate limit") ? (
            <div
              className="mt-8"
              style={{
                padding: 24,
                background: "rgba(239,159,39,0.08)",
                border: "0.5px solid rgba(239,159,39,0.3)",
                borderRadius: 14,
                textAlign: "center",
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
                style={{ margin: "0 auto 12px", display: "block" }}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#EF9F27", marginBottom: 6 }}>
                Slow down a bit
              </div>
              <div style={{ fontSize: 14, color: "#6b6690", lineHeight: 1.6, marginBottom: 16 }}>
                {analysisError}
              </div>
              <button
                onClick={() => {
                  setAnalysisError("");
                  setHasAnalyzed(false);
                }}
                style={{
                  background: "rgba(239,159,39,0.15)",
                  border: "0.5px solid rgba(239,159,39,0.3)",
                  color: "#EF9F27",
                  borderRadius: 8,
                  padding: "8px 20px",
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Try again
              </button>
            </div>
          ) : (
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
          )
        )}
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pro Max Comparison View                                            */
/* ------------------------------------------------------------------ */

function ProMaxComparisonView({
  modelResults,
  completedCount,
  totalModels,
  PRO_MAX_MODELS: models,
  expandedModel,
  setExpandedModel,
  selectedStrategy,
  address,
  editedProperty,
  userTier,
}: {
  modelResults: any[];
  completedCount: number;
  totalModels: number;
  PRO_MAX_MODELS: any[];
  expandedModel: string | null;
  setExpandedModel: (id: string | null) => void;
  selectedStrategy: string;
  address: string;
  editedProperty: any;
  userTier: string;
}) {
  const allComplete = completedCount === totalModels;

  // Expanded single-model view
  if (expandedModel) {
    const model = models.find((m: any) => m.id === expandedModel);
    const result = modelResults.find((r: any) => r.modelId === expandedModel);

    return (
      <div style={{ marginTop: 32 }}>
        <button
          onClick={() => setExpandedModel(null)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "transparent",
            border: "none",
            color: "#534AB7",
            fontSize: 13,
            cursor: "pointer",
            padding: "0 0 20px 0",
            fontFamily: "inherit",
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
          Back to comparison
        </button>

        <div
          style={{
            marginBottom: 20,
            padding: "16px 20px",
            background: model?.bgColor || "#13121d",
            border: `0.5px solid ${model?.borderColor || model?.color + "40"}`,
            borderRadius: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: `${model?.accentColor || model?.color}26`,
                  color: model?.accentColor || model?.color,
                  fontSize: 14,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {model?.icon || ""}
              </div>
              <div>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#e8e6f0" }}>
                  {model?.label}
                </span>
                <div
                  style={{
                    display: "inline-flex",
                    marginLeft: 8,
                    background: `${model?.accentColor || model?.color}1F`,
                    border: `0.5px solid ${model?.accentColor || model?.color}4D`,
                    borderRadius: 20,
                    padding: "1px 10px",
                    fontSize: 11,
                    fontWeight: 600,
                    color: model?.accentColor || model?.color,
                    letterSpacing: "0.3px",
                    textTransform: "uppercase",
                  }}
                >
                  {model?.roleLabel}
                </div>
              </div>
            </div>
            {result?.latencyMs && (
              <div style={{ fontSize: 11, color: "#3a3758" }}>
                {(result.latencyMs / 1000).toFixed(1)}s
              </div>
            )}
          </div>
          <div style={{ fontSize: 12, color: "#4e4a6a", lineHeight: 1.5 }}>
            {model?.roleDescription}
          </div>
        </div>

        {/* Narrative title */}
        <div
          style={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "1px",
            color: model?.accentColor || model?.color,
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 14 }}>{model?.icon || ""}</span>
          {model?.narrativeTitle || "Analysis"}
        </div>

        {result?.parsedResult ? (
          <AnalysisResults
            result={result.parsedResult}
            strategy={selectedStrategy}
            address={address}
            propertyData={editedProperty}
            calculations={result.serverCalculations}
            tier={userTier as any}
            model={model?.label || ""}
          />
        ) : (
          <div
            style={{ textAlign: "center", padding: 48, color: "#4e4a6a", fontSize: 14 }}
          >
            {result?.status === "error"
              ? `Analysis failed: ${result.error}`
              : "Analysis in progress..."}
          </div>
        )}
      </div>
    );
  }

  // Default: three-column comparison view
  return (
    <div style={{ marginTop: 32 }}>
      <style>{`
        @keyframes v2-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes v2-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes v2-stepIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .promax-grid {
            grid-template-columns: 1fr !important;
          }
          .promax-consensus {
            flex-direction: column !important;
            gap: 16px !important;
          }
          .results-header-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
        }
      `}</style>

      {/* Header */}
      <div
        className="results-header-row"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#e8e6f0",
              letterSpacing: "-0.3px",
              marginBottom: 4,
            }}
          >
            {allComplete ? "Max IQ Analysis Complete" : "Running Max IQ Analysis..."}
          </div>
          <div style={{ fontSize: 13, color: "#4e4a6a" }}>
            {allComplete
              ? "All 3 models complete \u2014 click any card to view full analysis"
              : `${completedCount} of ${totalModels} models complete`}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {models.map((m: any, i: number) => (
            <div
              key={m.id}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background:
                  modelResults[i]?.status === "complete"
                    ? m.color
                    : modelResults[i]?.status === "error"
                      ? "#f09595"
                      : "rgba(127,119,221,0.2)",
                border:
                  modelResults[i]?.status === "loading"
                    ? `2px solid ${m.color}`
                    : "none",
                animation:
                  modelResults[i]?.status === "loading"
                    ? "v2-pulse 1.5s ease infinite"
                    : "none",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
      </div>

      {/* Three model cards */}
      <div
        className="promax-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
        }}
      >
        {models.map((model: any, index: number) => {
          const result = modelResults[index];
          const isComplete = result?.status === "complete";
          const isError = result?.status === "error";
          const isLoading = result?.status === "loading";

          return (
            <div
              key={model.id}
              onClick={() => {
                if (isComplete) setExpandedModel(model.id);
              }}
              style={{
                background: model.bgColor || "#13121d",
                border: `0.5px solid ${
                  isComplete
                    ? model.borderColor || model.color + "50"
                    : isError
                      ? "rgba(240,149,149,0.3)"
                      : model.borderColor || "rgba(127,119,221,0.15)"
                }`,
                borderRadius: 14,
                overflow: "hidden",
                cursor: isComplete ? "pointer" : "default",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (isComplete) {
                  e.currentTarget.style.borderColor = (model.accentColor || model.color) + "60";
                  e.currentTarget.style.background = "#1a192b";
                }
              }}
              onMouseLeave={(e) => {
                if (isComplete) {
                  e.currentTarget.style.borderColor = model.borderColor || model.color + "50";
                  e.currentTarget.style.background = model.bgColor || "#13121d";
                }
              }}
            >
              {/* Model header */}
              <div
                style={{
                  background: `${model.accentColor || model.color}14`,
                  borderBottom: `0.5px solid ${model.borderColor || model.color + "40"}`,
                  padding: "14px 16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: `${model.accentColor || model.color}26`,
                        color: model.accentColor || model.color,
                        fontSize: 12,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 8,
                        flexShrink: 0,
                      }}
                    >
                      {model.icon || ""}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#e8e6f0" }}>
                      {model.label}
                    </span>
                  </div>
                  {isComplete && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={model.accentColor || model.color}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      {result?.latencyMs && (
                        <span style={{ fontSize: 10, color: "#3a3758" }}>
                          {(result.latencyMs / 1000).toFixed(1)}s
                        </span>
                      )}
                    </div>
                  )}
                  {isLoading && (
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        border: `2px solid ${model.accentColor || model.color}`,
                        borderTopColor: "transparent",
                        animation: "v2-spin 0.8s linear infinite",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  {isError && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f09595" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4M12 16h.01" />
                    </svg>
                  )}
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    background: `${model.accentColor || model.color}1F`,
                    border: `0.5px solid ${model.accentColor || model.color}4D`,
                    borderRadius: 20,
                    padding: "2px 10px",
                    fontSize: 11,
                    fontWeight: 600,
                    color: model.accentColor || model.color,
                    letterSpacing: "0.3px",
                    textTransform: "uppercase",
                  }}
                >
                  {model.roleLabel}
                </div>
                <div style={{ fontSize: 11, color: "#4e4a6a", lineHeight: 1.4, marginTop: 4 }}>
                  {model.roleDescription}
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: "14px 16px" }}>

              {/* Progress steps */}
              <div style={{ minHeight: 100, maxHeight: 180, overflowY: "auto" }}>
                {result?.progressSteps?.map((step: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 11,
                      color:
                        i === result.progressSteps.length - 1 && isLoading
                          ? "#9994b8"
                          : "#4e4a6a",
                      padding: "4px 0",
                      lineHeight: 1.5,
                      borderBottom: "0.5px solid rgba(127,119,221,0.05)",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 6,
                      animation: "v2-stepIn 0.3s ease forwards",
                    }}
                  >
                    <span
                      style={{
                        color: model.color,
                        flexShrink: 0,
                        fontSize: 10,
                        marginTop: 2,
                      }}
                    >
                      &rsaquo;
                    </span>
                    {step.detail}
                  </div>
                ))}
                {isLoading &&
                  (result?.progressSteps?.length === 0 ? (
                    <div
                      style={{
                        fontSize: 11,
                        color: "#3a3758",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: model.color,
                          animation: "v2-pulse 1s infinite",
                        }}
                      />
                      Connecting to {model.label}...
                    </div>
                  ) : (
                    <div
                      style={{
                        fontSize: 11,
                        color: "#3a3758",
                        marginTop: 4,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: model.color,
                          animation: "v2-pulse 1s infinite",
                        }}
                      />
                      Synthesizing analysis...
                    </div>
                  ))}
                {isError && (
                  <div style={{ fontSize: 11, color: "#f09595", marginTop: 4 }}>
                    {result.error}
                  </div>
                )}
              </div>

              {/* Deal score + metrics preview when complete */}
              {isComplete && result?.parsedResult && (
                <div style={{ marginTop: 12 }}>
                  <div
                    style={{
                      height: 0.5,
                      background: "rgba(127,119,221,0.1)",
                      marginBottom: 12,
                    }}
                  />
                  {/* Strategy-aware metric preview */}
                  {(() => {
                    const r = result.parsedResult;
                    const calc = result.serverCalculations;
                    const strat = selectedStrategy;

                    const secondMetric = (() => {
                      if (strat === "Fix & Flip" || strat === "flip") {
                        return {
                          label: "Net Profit",
                          value:
                            calc?.netProfit != null
                              ? `$${Math.abs(calc.netProfit).toLocaleString()}`
                              : r?.proForma?.netProfit != null
                                ? `$${Math.abs(r.proForma.netProfit).toLocaleString()}`
                                : "\u2014",
                          color:
                            (calc?.netProfit || r?.proForma?.netProfit || 0) >= 0
                              ? "#1D9E75"
                              : "#f09595",
                        };
                      }
                      if (strat === "BRRRR" || strat === "brrrr") {
                        return {
                          label: "Cash-on-Cash",
                          value:
                            r?.metrics?.cashOnCash != null
                              ? `${r.metrics.cashOnCash.toFixed(1)}%`
                              : "\u2014",
                          color: "#7F77DD",
                        };
                      }
                      if (strat === "House Hack" || strat === "house-hack") {
                        return {
                          label: "Mo. Savings",
                          value:
                            calc?.monthlyHousingSavings != null
                              ? `$${Math.abs(calc.monthlyHousingSavings).toLocaleString()}`
                              : "\u2014",
                          color: "#1D9E75",
                        };
                      }
                      // Buy & Hold default
                      const cf = r?.cashFlow?.monthly ?? calc?.cashFlow;
                      return {
                        label: "Cash Flow",
                        value:
                          cf != null
                            ? `${cf >= 0 ? "+" : "-"}$${Math.abs(cf).toLocaleString()}/mo`
                            : "\u2014",
                        color: (cf ?? 0) >= 0 ? "#1D9E75" : "#f09595",
                      };
                    })();

                    return (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 8,
                          marginBottom: 12,
                        }}
                      >
                        {/* Deal Score — always shown */}
                        <div
                          style={{
                            background: "rgba(83,74,183,0.08)",
                            borderRadius: 8,
                            padding: "8px 10px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 10,
                              color: "#3a3758",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              marginBottom: 4,
                            }}
                          >
                            Deal Score
                          </div>
                          <div
                            style={{
                              fontSize: 20,
                              fontWeight: 700,
                              letterSpacing: "-0.5px",
                              color:
                                (r?.dealScore ?? 0) >= 7
                                  ? "#1D9E75"
                                  : (r?.dealScore ?? 0) <= 4
                                    ? "#f09595"
                                    : model.accentColor || "#EF9F27",
                            }}
                          >
                            {r?.dealScore ?? "\u2014"}
                            <span
                              style={{
                                fontSize: 12,
                                color: "#3a3758",
                                fontWeight: 400,
                              }}
                            >
                              /10
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              textTransform: "uppercase",
                              letterSpacing: "0.8px",
                              color: model.accentColor || model.color,
                              marginTop: 4,
                              opacity: 0.8,
                            }}
                          >
                            {model.scoreLabel || "Deal Score"}
                          </div>
                        </div>
                        {/* Strategy-specific metric */}
                        <div
                          style={{
                            background: "rgba(83,74,183,0.08)",
                            borderRadius: 8,
                            padding: "8px 10px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 10,
                              color: "#3a3758",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              marginBottom: 4,
                            }}
                          >
                            {secondMetric.label}
                          </div>
                          <div
                            style={{
                              fontSize: 16,
                              fontWeight: 700,
                              letterSpacing: "-0.3px",
                              color: secondMetric.color,
                            }}
                          >
                            {secondMetric.value}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  {result.parsedResult.recommendation && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "#6b6690",
                        lineHeight: 1.5,
                        borderTop: "0.5px solid rgba(127,119,221,0.08)",
                        paddingTop: 10,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical" as any,
                        overflow: "hidden",
                      }}
                    >
                      {result.parsedResult.recommendation}
                    </div>
                  )}
                  <div
                    style={{
                      marginTop: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      fontSize: 12,
                      color: model.color,
                      fontWeight: 500,
                    }}
                  >
                    View full analysis
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M5 2l5 5-5 5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              )}
              </div>{/* end card body */}
            </div>
          );
        })}
      </div>

      {/* Consensus summary when all complete */}
      {allComplete && (() => {
        const scores = modelResults
          .map((r) => r.parsedResult?.dealScore)
          .filter((s: any) => s != null);
        if (scores.length < 2) return null;
        const min = Math.min(...scores);
        const max = Math.max(...scores);
        const avg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
        const variance = max - min;

        return (
          <>
          <div
            className="promax-consensus"
            style={{
              marginTop: 16,
              padding: "14px 18px",
              background: "#13121d",
              border: "0.5px solid rgba(127,119,221,0.15)",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              gap: 24,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  color: "#3a3758",
                  marginBottom: 4,
                }}
              >
                Avg Deal Score
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color:
                    avg >= 7 ? "#1D9E75" : avg >= 5 ? "#EF9F27" : "#f09595",
                  letterSpacing: "-0.5px",
                }}
              >
                {avg.toFixed(1)}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  color: "#3a3758",
                  marginBottom: 4,
                }}
              >
                Score Range
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#9994b8" }}>
                {min} &ndash; {max}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  color: "#3a3758",
                  marginBottom: 4,
                }}
              >
                Model Consensus
              </div>
              <div
                style={{
                  fontSize: 13,
                  color:
                    variance <= 1
                      ? "#1D9E75"
                      : variance <= 3
                        ? "#EF9F27"
                        : "#f09595",
                }}
              >
                {variance === 0
                  ? "All models agree"
                  : variance <= 1
                    ? "Strong consensus"
                    : variance <= 3
                      ? "Moderate variance"
                      : "High variance \u2014 review each model"}
              </div>
            </div>
            {/* Strategy-relevant avg metric */}
            {(() => {
              if (
                selectedStrategy === "Fix & Flip" ||
                selectedStrategy === "flip"
              ) {
                const profits = modelResults
                  .map(
                    (r: any) =>
                      r.serverCalculations?.netProfit ??
                      r.parsedResult?.proForma?.netProfit
                  )
                  .filter((p: any) => p != null);
                if (profits.length === 0) return null;
                const avgProfit =
                  profits.reduce((a: number, b: number) => a + b, 0) /
                  profits.length;
                return (
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        color: "#3a3758",
                        marginBottom: 4,
                      }}
                    >
                      Avg Net Profit
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: avgProfit >= 0 ? "#1D9E75" : "#f09595",
                      }}
                    >
                      ${Math.abs(Math.round(avgProfit)).toLocaleString()}
                    </div>
                  </div>
                );
              }
              const cashFlows = modelResults
                .map(
                  (r: any) =>
                    r.parsedResult?.cashFlow?.monthly ??
                    r.serverCalculations?.cashFlow
                )
                .filter((c: any) => c != null);
              if (cashFlows.length === 0) return null;
              const avgCashFlow =
                cashFlows.reduce((a: number, b: number) => a + b, 0) /
                cashFlows.length;
              return (
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      color: "#3a3758",
                      marginBottom: 4,
                    }}
                  >
                    Avg Cash Flow
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: avgCashFlow >= 0 ? "#1D9E75" : "#f09595",
                    }}
                  >
                    {avgCashFlow >= 0 ? "+" : "-"}$
                    {Math.abs(Math.round(avgCashFlow)).toLocaleString()}/mo
                  </div>
                </div>
              );
            })()}

            <div style={{ fontSize: 12, color: "#3a3758" }}>
              Click any card above &rarr;
            </div>
          </div>
          <div
            style={{
              marginTop: 12,
              padding: "10px 14px",
              background: "rgba(83,74,183,0.06)",
              borderRadius: 8,
              fontSize: 12,
              color: "#6b6690",
              lineHeight: 1.5,
            }}
          >
            {variance === 0
              ? "\u26A1 Rare: all three models agree exactly. High conviction signal."
              : variance <= 1
                ? "\u2713 Strong consensus \u2014 The Skeptic, Sponsor, and Quant all see this deal similarly."
                : variance <= 2
                  ? "~ Moderate variance \u2014 some disagreement between risk and opportunity perspectives."
                  : variance <= 3
                    ? "\u26A0 Notable variance \u2014 The Skeptic sees more risk than the Sponsor sees opportunity. Dig deeper."
                    : "\u26A0 High variance \u2014 fundamental disagreement between models. Proceed with caution."}
          </div>
          </>
        );
      })()}
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
