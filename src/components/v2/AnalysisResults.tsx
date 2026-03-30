"use client";

import { useEffect, useRef } from "react";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController,
} from "chart.js";

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController
);

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface AnalysisResult {
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
  cashFlow?: { monthly?: number | null; annual?: number | null };
  proForma?: Record<string, number | null>;
  riskFlags?: Array<{
    severity: "low" | "medium" | "high";
    flag: string;
    detail?: string;
  }>;
  narrative?: string;
  marketContext?: string;
  dealScore?: number;
  breakEvenArv?: number | null;
  capitalRecoveryPercent?: number | null;
  effectiveMonthlyCost?: number | null;
  grm?: number | null;
  fiveYearEquity?: number | null;
  annualAppreciationRate?: number;
  projectionNotes?: string;
}

export interface AnalysisResultsProps {
  result: AnalysisResult;
  strategy: string;
  address: string;
  propertyData: any;
  calculations: any;
  tier: "free" | "pro" | "pro_max";
  model?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function $(v: number | null | undefined): string {
  if (v == null) return "—";
  return (
    (v < 0 ? "-" : "") +
    "$" +
    Math.abs(v).toLocaleString("en-US", { maximumFractionDigits: 0 })
  );
}

function pct(v: number | null | undefined): string {
  if (v == null) return "—";
  return v.toFixed(1) + "%";
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function MetricCard({
  label,
  value,
  color,
  sub,
}: {
  label: string;
  value: string;
  color: string;
  sub?: string;
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
          fontSize: 10,
          letterSpacing: "0.8px",
          color: "#3a3758",
          margin: "0 0 6px",
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
      {sub && (
        <p style={{ fontSize: 12, color: "#4e4a6a", marginTop: 4 }}>{sub}</p>
      )}
    </div>
  );
}

function ProFormaRow({
  label,
  value,
  bold,
  isLast,
  prefix,
}: {
  label: string;
  value: string;
  bold?: boolean;
  isLast?: boolean;
  prefix?: "+" | "-";
}) {
  const prefixColor =
    prefix === "+" ? "#1D9E75" : prefix === "-" ? "#f09595" : undefined;
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
      <span
        style={{
          fontSize: bold ? 14 : 13,
          color: bold ? "#e8e6f0" : "#4e4a6a",
          fontWeight: bold ? 700 : 400,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: bold ? 15 : 13,
          color: prefixColor || (bold ? "#f0eeff" : "#e8e6f0"),
          fontWeight: bold ? 700 : 500,
        }}
      >
        {prefix && (
          <span style={{ color: prefixColor, marginRight: 2 }}>
            {prefix}
          </span>
        )}
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
  const colors: Record<string, { bg: string; fg: string }> = {
    high: { bg: "rgba(162,45,45,0.15)", fg: "#f09595" },
    medium: { bg: "rgba(186,117,23,0.15)", fg: "#EF9F27" },
    low: { bg: "rgba(29,158,117,0.15)", fg: "#1D9E75" },
  };
  const c = colors[severity] || colors.medium;

  return (
    <div
      className="flex items-start"
      style={{
        padding: "10px 0",
        borderBottom: isLast ? "none" : "0.5px solid rgba(127,119,221,0.06)",
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

function TierGate({
  tier,
  requiredTier,
  children,
  label,
}: {
  tier: string;
  requiredTier: "pro" | "pro_max";
  children: React.ReactNode;
  label: string;
}) {
  const hasAccess =
    requiredTier === "pro"
      ? tier === "pro" || tier === "pro_max"
      : tier === "pro_max";

  if (hasAccess) return <>{children}</>;

  return (
    <div style={{ position: "relative", marginBottom: 20 }}>
      <div
        style={{
          filter: "blur(6px)",
          pointerEvents: "none",
          userSelect: "none",
          opacity: 0.4,
        }}
      >
        {children}
      </div>
      <div
        className="flex flex-col items-center justify-center"
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(13,13,20,0.7)",
          borderRadius: 12,
          border: "0.5px solid rgba(127,119,221,0.3)",
        }}
      >
        <p style={{ fontSize: 13, color: "#9994b8", marginBottom: 12, textAlign: "center" }}>
          {label}
        </p>
        <button
          onClick={() => (window.location.href = "/pricing")}
          style={{
            background: "#534AB7",
            color: "#f0eeff",
            border: "none",
            borderRadius: 8,
            padding: "9px 22px",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Upgrade to unlock →
        </button>
      </div>
    </div>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <p
      className="uppercase"
      style={{
        fontSize: 11,
        letterSpacing: "0.8px",
        color: "#3a3758",
        margin: "0 0 14px",
      }}
    >
      {text}
    </p>
  );
}

function CardWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={className || "mb-5"}
      style={{
        background: "#13121d",
        border: "0.5px solid rgba(127,119,221,0.15)",
        borderRadius: 12,
        padding: "20px 22px",
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Takeaways generator                                                */
/* ------------------------------------------------------------------ */

function generateTakeaways(
  result: AnalysisResult,
  strategy: string,
  calc: any
): string[] {
  const points: string[] = [];
  const fm = result.financial_metrics;
  const v2m = result.metrics;

  // Takeaway 1: Primary return metric
  if (strategy === "Fix & Flip") {
    const roi = calc?.roi ?? fm?.roi ?? v2m?.roi;
    if (roi != null) {
      points.push(
        roi > 20
          ? `Strong ${roi.toFixed(1)}% ROI on cash invested — well above the 20% threshold for a compelling flip`
          : roi > 10
            ? `Moderate ${roi.toFixed(1)}% ROI — acceptable but negotiate harder on purchase price`
            : `Thin ${roi.toFixed(1)}% ROI — this deal needs a lower purchase price or reduced rehab scope`
      );
    }
  }
  if (strategy === "Buy & Hold" || strategy === "BRRRR") {
    const coc = v2m?.cashOnCash ?? fm?.cash_on_cash_return;
    if (coc != null) {
      points.push(
        coc > 8
          ? `${coc.toFixed(1)}% cash-on-cash return exceeds the 8% benchmark for strong rental properties`
          : coc > 5
            ? `${coc.toFixed(1)}% cash-on-cash is acceptable — market appreciation will drive long-term returns`
            : `${coc.toFixed(1)}% cash-on-cash is below the 5% minimum — reconsider purchase price`
      );
    }
  }
  if (strategy === "House Hack") {
    const savings = calc?.monthlyHousingSavings ?? calc?.savingsVsRenting;
    if (savings != null) {
      points.push(
        savings > 500
          ? `Saving $${Math.round(savings).toLocaleString()}/mo vs renting — strong house hack economics`
          : savings > 0
            ? `Saving $${Math.round(savings).toLocaleString()}/mo vs renting — solid but modest house hack`
            : `Net cost is higher than renting equivalent — reconsider the numbers`
      );
    }
  }

  // Takeaway 2: Risk assessment
  const highFlags = result.riskFlags?.filter((f) => f.severity === "high") || [];
  points.push(
    highFlags.length > 0
      ? `${highFlags.length} high-severity risk factor${highFlags.length > 1 ? "s" : ""} identified — specifically: ${highFlags[0].flag}`
      : "No high-severity risks detected — standard due diligence applies"
  );

  // Takeaway 3: Deal score
  const score = result.dealScore;
  if (score != null) {
    points.push(
      score >= 8
        ? `Deal score ${score}/10 — top tier opportunity, move quickly in this market`
        : score >= 6
          ? `Deal score ${score}/10 — solid deal with room to optimize returns`
          : `Deal score ${score}/10 — marginal deal, significant price reduction needed`
    );
  }

  return points;
}

/* ------------------------------------------------------------------ */
/*  Projection Chart (Chart.js npm)                                    */
/* ------------------------------------------------------------------ */

function ProjectionChart({
  strategy,
  calculations,
  result,
}: {
  strategy: string;
  calculations: any;
  result: AnalysisResult;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (!calculations && !result) return;

    // Destroy existing chart instance before creating new one
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const chartConfig = buildChartConfig(
      strategy,
      calculations,
      result,
      (n: number) => `$${Math.round(n).toLocaleString()}`,
      (n: number) => `${n.toFixed(1)}%`
    );

    if (!chartConfig) {
      console.warn(
        "buildChartConfig returned null. Strategy:",
        strategy,
        "Has calculations:", !!calculations,
        "Has result:", !!result
      );
      return;
    }

    try {
      chartRef.current = new Chart(ctx, chartConfig as any);
    } catch (err) {
      console.error("Chart.js render error:", err);
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [strategy, calculations, result]);

  return (
    <CardWrapper>
      <SectionLabel
        text={
          strategy === "Fix & Flip"
            ? "Profit Sensitivity Analysis"
            : strategy === "BRRRR"
              ? "Equity + Cash Flow Growth"
              : strategy === "House Hack"
                ? "Cost vs Renting Comparison"
                : "Wealth Building Projection"
        }
      />
      <div style={{ position: "relative", width: "100%", height: "300px" }}>
        <canvas ref={canvasRef} />
      </div>
    </CardWrapper>
  );
}

function buildChartConfig(
  strategy: string,
  calculations: any,
  result: any,
  _fmtDollar?: (n: number) => string,
  _fmtPct?: (n: number) => string,
): any {
  // Normalize field names from serverCalculations + parsedResult
  const monthlyRent = calculations?.monthlyRent || 0;
  const monthlyCashFlow =
    calculations?.cashFlow || result?.cashFlow?.monthly || 0;
  const annualCashFlow = monthlyCashFlow * 12;
  const purchasePrice = result?.proForma?.purchasePrice || 0;
  const appreciationRate = result?.annualAppreciationRate || 3;
  const totalInvestment =
    calculations?.totalInvestment || result?.proForma?.totalInvestment || 0;
  const loanAmount = purchasePrice > 0 ? purchasePrice - totalInvestment : 0;
  const interestRate = 7.5;
  const monthlyRate = interestRate / 100 / 12;

  const gridColor = "rgba(127,119,221,0.08)";
  const tickColor = "#3a3758";
  const tooltipBg = "#1a192b";

  const ns =
    strategy === "Buy & Hold"
      ? "buy_hold"
      : strategy === "Fix & Flip"
        ? "fix_flip"
        : strategy === "BRRRR"
          ? "brrrr"
          : strategy === "House Hack"
            ? "house_hack"
            : strategy?.toLowerCase().replace(" ", "_");

  // ── BUY & HOLD: Wealth Building Projection ──
  if (ns === "buy_hold" || ns === "rental") {
    const years = [1, 2, 3, 4, 5, 10, 15, 20, 25, 30];

    const calcEquityFromPaydown = (year: number) => {
      if (!purchasePrice || loanAmount <= 0) return 0;
      let balance = loanAmount;
      let totalPrincipal = 0;
      const payment =
        (loanAmount * monthlyRate) /
        (1 - Math.pow(1 + monthlyRate, -360));
      for (let i = 0; i < year * 12; i++) {
        const interest = balance * monthlyRate;
        const principal = Math.max(0, payment - interest);
        balance = Math.max(0, balance - principal);
        totalPrincipal += principal;
      }
      return Math.round(totalPrincipal);
    };

    const labels = years.map((y) => `Year ${y}`);
    const appreciationData = years.map((y) =>
      Math.round(purchasePrice * (Math.pow(1 + appreciationRate / 100, y) - 1))
    );
    const paydownData = years.map((y) => calcEquityFromPaydown(y));
    const cashFlowData = years.map((y) => {
      let total = 0;
      for (let i = 1; i <= y; i++) {
        total += Math.round(annualCashFlow * Math.pow(1.02, i - 1));
      }
      return total;
    });
    const totalData = years.map(
      (_, i) => appreciationData[i] + paydownData[i] + cashFlowData[i]
    );

    return {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Appreciation Equity",
            data: appreciationData,
            backgroundColor: "rgba(83,74,183,0.7)",
            borderRadius: 4,
            stack: "equity",
          },
          {
            label: "Loan Paydown",
            data: paydownData,
            backgroundColor: "rgba(29,158,117,0.7)",
            borderRadius: 4,
            stack: "equity",
          },
          {
            label: "Cumulative Cash Flow",
            data: cashFlowData,
            backgroundColor:
              cashFlowData[0] >= 0
                ? "rgba(127,119,221,0.5)"
                : "rgba(240,149,149,0.5)",
            borderRadius: 4,
            stack: "equity",
          },
          {
            label: "Total Wealth Impact",
            data: totalData,
            type: "line",
            borderColor: "#f0eeff",
            backgroundColor: "transparent",
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: "#f0eeff",
            tension: 0.3,
            stack: undefined,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#9994b8", font: { size: 11 }, padding: 16, boxWidth: 12 },
          },
          tooltip: {
            backgroundColor: tooltipBg,
            borderColor: "rgba(127,119,221,0.3)",
            borderWidth: 1,
            titleColor: "#f0eeff",
            bodyColor: "#9994b8",
            padding: 12,
            callbacks: {
              label: (ctx: any) => {
                const v = ctx.raw;
                return ` ${ctx.dataset.label}: ${v >= 0 ? "+" : ""}$${Math.abs(v).toLocaleString()}`;
              },
            },
          },
        },
        scales: {
          x: { stacked: true, grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 11 } } },
          y: {
            stacked: true,
            grid: { color: gridColor },
            ticks: {
              color: tickColor,
              font: { size: 11 },
              callback: (v: any) => (Math.abs(v) >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`),
            },
          },
        },
      },
    };
  }

  // ── FIX & FLIP: Profit Sensitivity ──
  if (ns === "fix_flip" || ns === "flip") {
    const arv =
      result?.metrics?.arvEstimate || calculations?.arv || purchasePrice * 1.2;
    const rehabCost = result?.proForma?.rehabCost || calculations?.rehabCost || 0;
    const loanAmt = calculations?.loanAmount || purchasePrice * 0.9;
    const hmRate = 12;
    const mInterest = loanAmt * (hmRate / 100 / 12);
    const pts = calculations?.pointsCost || loanAmt * 0.02;
    const buyClose = calculations?.buySideClosing || purchasePrice * 0.03;
    const sellClose = arv * 0.06;
    const mHolding = purchasePrice * 0.008 / 12;

    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 18];

    const calcProfit = (m: number, rehabMult = 1) => {
      const rehab = rehabCost * rehabMult;
      const interest = mInterest * m;
      const holding = mHolding * m;
      return Math.round(arv - purchasePrice - rehab - interest - pts - buyClose - holding - sellClose);
    };

    return {
      type: "line",
      data: {
        labels: months.map((m) => `${m}mo`),
        datasets: [
          {
            label: "Base case profit",
            data: months.map((m) => calcProfit(m)),
            borderColor: "#7F77DD",
            backgroundColor: "rgba(127,119,221,0.08)",
            borderWidth: 2,
            fill: true,
            tension: 0.3,
            pointRadius: 3,
          },
          {
            label: "+25% rehab overrun",
            data: months.map((m) => calcProfit(m, 1.25)),
            borderColor: "#f09595",
            backgroundColor: "rgba(240,149,149,0.05)",
            borderWidth: 2,
            borderDash: [5, 5],
            fill: true,
            tension: 0.3,
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#9994b8", font: { size: 11 }, padding: 16, boxWidth: 12 },
          },
          tooltip: {
            backgroundColor: tooltipBg,
            borderColor: "rgba(127,119,221,0.3)",
            borderWidth: 1,
            titleColor: "#f0eeff",
            bodyColor: "#9994b8",
            padding: 12,
            callbacks: {
              label: (ctx: any) => {
                const v = ctx.raw;
                return ` ${ctx.dataset.label}: ${v >= 0 ? "" : "-"}$${Math.abs(v).toLocaleString()}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: tickColor, font: { size: 11 } },
            title: { display: true, text: "Holding period", color: tickColor, font: { size: 11 } },
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: tickColor,
              font: { size: 11 },
              callback: (v: any) => (Math.abs(v) >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`),
            },
            title: { display: true, text: "Net profit", color: tickColor, font: { size: 11 } },
          },
        },
      },
    };
  }

  // ── BRRRR: Equity + Cash Flow Growth ──
  if (ns === "brrrr") {
    const arv =
      result?.metrics?.arvEstimate || calculations?.arv || purchasePrice * 1.2;
    const refiLoan = arv * 0.75;
    const refiRate = 8.0;
    const refiMonthlyRate = refiRate / 100 / 12;
    const refiPayment =
      (refiLoan * refiMonthlyRate) /
      (1 - Math.pow(1 + refiMonthlyRate, -360));
    const rent = monthlyRent;
    const expenses = refiPayment + purchasePrice * 0.015 / 12;
    const mCashFlow = rent - expenses;

    const years = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const equityData = years.map((y) => {
      const appreciation = arv * (Math.pow(1 + appreciationRate / 100, y) - 1);
      let balance = refiLoan;
      for (let m = 0; m < y * 12; m++) {
        const interest = balance * refiMonthlyRate;
        balance -= refiPayment - interest;
      }
      return Math.round(appreciation + (refiLoan - Math.max(0, balance)));
    });

    const cashFlowData = years.map((y) => {
      let total = 0;
      for (let i = 1; i <= y; i++) {
        total += Math.round(mCashFlow * 12 * Math.pow(1.02, i - 1));
      }
      return total;
    });

    return {
      type: "line",
      data: {
        labels: years.map((y) => `Year ${y}`),
        datasets: [
          {
            label: "Cumulative equity",
            data: equityData,
            borderColor: "#7F77DD",
            backgroundColor: "rgba(127,119,221,0.08)",
            fill: true,
            borderWidth: 2,
            tension: 0.3,
            yAxisID: "y",
          },
          {
            label: "Cumulative cash flow",
            data: cashFlowData,
            borderColor: cashFlowData[0] >= 0 ? "#1D9E75" : "#f09595",
            backgroundColor:
              cashFlowData[0] >= 0
                ? "rgba(29,158,117,0.06)"
                : "rgba(240,149,149,0.06)",
            fill: true,
            borderWidth: 2,
            tension: 0.3,
            yAxisID: "y1",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#9994b8", font: { size: 11 }, padding: 16 },
          },
          tooltip: {
            backgroundColor: tooltipBg,
            borderColor: "rgba(127,119,221,0.3)",
            borderWidth: 1,
            titleColor: "#f0eeff",
            bodyColor: "#9994b8",
            padding: 12,
            callbacks: {
              label: (ctx: any) => {
                const v = ctx.raw;
                return ` ${ctx.dataset.label}: ${v >= 0 ? "+" : ""}$${Math.abs(v).toLocaleString()}`;
              },
            },
          },
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 11 } } },
          y: {
            position: "left",
            grid: { color: gridColor },
            ticks: {
              color: tickColor,
              font: { size: 11 },
              callback: (v: any) => `$${(v / 1000).toFixed(0)}k`,
            },
            title: { display: true, text: "Equity", color: tickColor },
          },
          y1: {
            position: "right",
            grid: { drawOnChartArea: false },
            ticks: {
              color: tickColor,
              font: { size: 11 },
              callback: (v: any) => `$${(v / 1000).toFixed(0)}k`,
            },
            title: { display: true, text: "Cash Flow", color: tickColor },
          },
        },
      },
    };
  }

  // ── HOUSE HACK: Cost vs Renting ──
  if (ns === "house_hack" || ns === "househack") {
    const netMonthlyCost =
      calculations?.netMonthlyCost ||
      result?.effectiveMonthlyCost ||
      calculations?.outOfPocketHousingCost ||
      0;
    const marketRent = monthlyRent > 0 ? monthlyRent * 1.3 : 2000;

    const years = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const rentingCost = years.map((y) =>
      Math.round(marketRent * Math.pow(1.04, y - 1))
    );
    const hackCost = years.map((y) =>
      Math.round(Math.max(0, netMonthlyCost) * Math.pow(0.98, y - 1))
    );

    return {
      type: "line",
      data: {
        labels: years.map((y) => `Year ${y}`),
        datasets: [
          {
            label: "Renting equivalent",
            data: rentingCost,
            borderColor: "#f09595",
            backgroundColor: "rgba(240,149,149,0.05)",
            borderWidth: 2,
            tension: 0.3,
            fill: false,
          },
          {
            label: "Your monthly cost",
            data: hackCost,
            borderColor: "#1D9E75",
            backgroundColor: "rgba(29,158,117,0.08)",
            borderWidth: 2,
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#9994b8", font: { size: 11 }, padding: 16 },
          },
          tooltip: {
            backgroundColor: tooltipBg,
            borderColor: "rgba(127,119,221,0.3)",
            borderWidth: 1,
            titleColor: "#f0eeff",
            bodyColor: "#9994b8",
            padding: 12,
            callbacks: {
              label: (ctx: any) =>
                ` ${ctx.dataset.label}: $${ctx.raw.toLocaleString()}/mo`,
            },
          },
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 11 } } },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: tickColor,
              font: { size: 11 },
              callback: (v: any) => `$${v.toLocaleString()}/mo`,
            },
          },
        },
      },
    };
  }

  return null;
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function AnalysisResults({
  result,
  strategy,
  address,
  propertyData,
  calculations: calc,
  tier,
  model,
}: AnalysisResultsProps) {
  const fm = result.financial_metrics;
  const v2m = result.metrics;
  const v2cf = result.cashFlow;

  const isFlip = strategy === "Fix & Flip";
  const isBRRRR = strategy === "BRRRR";
  const isBuyHold = strategy === "Buy & Hold";
  const isHouseHack = strategy === "House Hack";

  const dealScore = result.dealScore;
  let scoreColor = "#EF9F27";
  let scoreLabel = "Moderate Deal";
  let scoreSub = "Acceptable returns with some risk factors. Negotiate hard on price.";
  if (dealScore != null) {
    if (dealScore >= 8) {
      scoreColor = "#1D9E75";
      scoreLabel = "Strong Deal";
      scoreSub = "Above-average returns for this market. Numbers support moving forward.";
    } else if (dealScore <= 4) {
      scoreColor = "#f09595";
      scoreLabel = "Weak Deal";
      scoreSub = "Below-average returns. This deal needs significant price reduction to make sense.";
    }
  }

  // Risk items — prefer V2 structured riskFlags
  const riskItems: { severity: string; flag: string; detail?: string }[] = [];
  if (result.riskFlags?.length) {
    result.riskFlags.forEach((rf) => riskItems.push(rf));
  } else if (result.risks) {
    result.risks.forEach((r) => {
      const l = r.toLowerCase();
      let sev = "medium";
      if (l.includes("high") || l.includes("significant")) sev = "high";
      else if (l.includes("low") || l.includes("minor")) sev = "low";
      riskItems.push({ severity: sev, flag: r });
    });
  }

  const hasHighRisk = riskItems.some((r) => r.severity === "high");
  const takeaways = generateTakeaways(result, strategy, calc);

  /* ================================================================ */
  /*  Build strategy-specific metric cards                             */
  /* ================================================================ */

  const metrics: { label: string; value: string; color: string; sub?: string }[] = [];

  // Common metrics
  const purchasePrice = calc?.purchasePrice ?? result.proForma?.purchasePrice;
  if (purchasePrice != null)
    metrics.push({ label: "Purchase Price", value: $(purchasePrice), color: "#f0eeff", sub: "acquisition cost" });

  const dp = calc?.downPayment;
  const dpPct = calc?.downPaymentPercent;
  if (dp != null)
    metrics.push({ label: "Down Payment", value: $(dp), color: "#f0eeff", sub: dpPct ? `${dpPct}% down` : undefined });

  const cashInvested = calc?.cashRequired ?? calc?.totalCashInvested ?? fm?.total_investment;
  if (cashInvested != null)
    metrics.push({ label: "Total Cash Invested", value: $(cashInvested), color: "#f0eeff", sub: "out of pocket" });

  if (isFlip) {
    const profit = calc?.netProfit ?? fm?.total_profit ?? fm?.net_profit;
    if (profit != null)
      metrics.push({ label: "Net Profit", value: $(profit), color: profit >= 0 ? "#1D9E75" : "#f09595", sub: "after all costs" });

    const roi = calc?.roi ?? fm?.roi ?? v2m?.roi;
    if (roi != null)
      metrics.push({ label: "ROI", value: pct(roi), color: "#7F77DD", sub: "return on cash invested" });

    if (calc?.totalProjectCost != null)
      metrics.push({ label: "Total Project Cost", value: $(calc.totalProjectCost), color: "#f0eeff", sub: "all in" });

    const arv = calc?.arv ?? fm?.arv ?? v2m?.arvEstimate;
    if (arv != null)
      metrics.push({ label: "ARV", value: $(arv), color: "#f0eeff", sub: "after repair value" });

    if (calc?.renovationCosts != null || calc?.rehabCost != null)
      metrics.push({ label: "Rehab Cost", value: $(calc.renovationCosts ?? calc.rehabCost), color: "#EF9F27", sub: "renovation budget" });

    if (calc?.holdingCosts != null)
      metrics.push({ label: "Holding Costs", value: $(calc.holdingCosts), color: "#f09595", sub: `${calc.holdingMonths ?? '?'}mo hold` });

    if (calc?.pointsCost != null)
      metrics.push({ label: "Points Cost", value: $(calc.pointsCost), color: "#f09595", sub: `${calc.closingCostsBreakdown?.lenderPointsPercent ?? '?'} points` });

    if (calc?.sellingCosts != null)
      metrics.push({ label: "Sell-Side Closing", value: $(calc.sellingCosts), color: "#f09595", sub: "~6% agent commission" });

    if (calc?.mao70 != null)
      metrics.push({ label: "Max Offer (70%)", value: $(calc.mao70), color: "#1D9E75", sub: "conservative target" });

    if (calc?.mao85 != null)
      metrics.push({ label: "Max Offer (85%)", value: $(calc.mao85), color: "#EF9F27", sub: "hard money ceiling" });
  }

  if (isBRRRR) {
    const arv = calc?.arv ?? fm?.arv ?? v2m?.arvEstimate;
    if (arv != null)
      metrics.push({ label: "ARV", value: $(arv), color: "#f0eeff" });

    if (calc?.renovationCosts != null)
      metrics.push({ label: "Rehab Cost", value: $(calc.renovationCosts), color: "#EF9F27" });

    const equity = calc?.equityCapture ?? fm?.cash_returned ?? v2m?.equityCapture;
    if (equity != null)
      metrics.push({ label: "Equity Capture", value: $(equity), color: "#1D9E75", sub: "ARV minus cost basis" });

    const capRecov = calc?.capitalRecoveryPercent ?? fm?.capital_recovery_percent ?? result.capitalRecoveryPercent;
    if (capRecov != null)
      metrics.push({ label: "Capital Recycled", value: capRecov >= 100 ? "Full Recovery" : pct(capRecov), color: "#1D9E75", sub: "cash returned from refi" });

    const cf = fm?.monthly_cash_flow ?? v2cf?.monthly;
    if (cf != null)
      metrics.push({ label: "Monthly Cash Flow", value: $(cf), color: cf >= 0 ? "#1D9E75" : "#f09595", sub: "after refi" });

    const coc = fm?.cash_on_cash_return ?? v2m?.cashOnCash;
    if (coc != null && isFinite(coc))
      metrics.push({ label: "Cash on Cash", value: pct(coc), color: "#7F77DD", sub: "post-refi return" });

    const capRate = fm?.cap_rate ?? v2m?.capRate;
    if (capRate != null)
      metrics.push({ label: "Cap Rate", value: pct(capRate), color: "#7F77DD" });
  }

  if (isBuyHold) {
    const rent = fm?.monthly_rent ?? v2m?.monthlyRent;
    if (rent != null)
      metrics.push({ label: "Monthly Rent", value: $(rent), color: "#1D9E75" });

    const cf = fm?.monthly_cash_flow ?? v2cf?.monthly;
    if (cf != null)
      metrics.push({ label: "Net Cash Flow", value: $(cf), color: cf >= 0 ? "#1D9E75" : "#f09595", sub: "monthly net" });

    const annualCF = v2cf?.annual ?? (cf != null ? cf * 12 : null);
    if (annualCF != null)
      metrics.push({ label: "Annual Cash Flow", value: $(annualCF), color: annualCF >= 0 ? "#1D9E75" : "#f09595" });

    const capRate = fm?.cap_rate ?? v2m?.capRate;
    if (capRate != null)
      metrics.push({ label: "Cap Rate", value: pct(capRate), color: "#7F77DD" });

    const coc = fm?.cash_on_cash_return ?? v2m?.cashOnCash;
    if (coc != null)
      metrics.push({ label: "Cash on Cash", value: pct(coc), color: "#7F77DD" });

    const noi = fm?.annual_noi ?? v2m?.noi;
    if (noi != null)
      metrics.push({ label: "NOI", value: $(noi), color: "#f0eeff", sub: "net operating income/yr" });

    const grm = result.grm ?? (purchasePrice && rent ? Math.round((purchasePrice / (rent * 12)) * 10) / 10 : null);
    if (grm != null)
      metrics.push({ label: "GRM", value: String(grm), color: "#f0eeff", sub: "gross rent multiplier" });
  }

  if (isHouseHack) {
    const netCost = result.effectiveMonthlyCost ?? calc?.effectiveMortgage ?? calc?.netMonthlyCost;
    if (netCost != null)
      metrics.push({ label: "Net Monthly Cost", value: $(netCost), color: "#1D9E75", sub: "your effective payment" });

    const rental = fm?.monthly_rent ?? v2m?.monthlyRent ?? calc?.rentalIncome;
    if (rental != null)
      metrics.push({ label: "Rental Income", value: $(rental), color: "#1D9E75" });

    const savings = calc?.monthlyHousingSavings ?? calc?.savingsVsRenting;
    if (savings != null)
      metrics.push({ label: "Monthly Savings", value: $(savings), color: "#1D9E75", sub: "vs renting equivalent" });

    const roi = fm?.roi ?? v2m?.roi;
    if (roi != null)
      metrics.push({ label: "Housing ROI", value: pct(roi), color: "#7F77DD" });
  }

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  return (
    <div className="mt-8">
      {/* === SECTION A: Deal Score === */}
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
          <div className="shrink-0" style={{ minWidth: 80 }}>
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
            <p style={{ fontSize: 13, color: "#3a3758", margin: "4px 0 0" }}>
              / 10 deal score
            </p>
          </div>
          <div className="flex-1">
            <p style={{ fontSize: 16, fontWeight: 600, color: scoreColor, margin: 0 }}>
              {scoreLabel}
            </p>
            <p style={{ fontSize: 13, color: "#4e4a6a", marginTop: 4, lineHeight: 1.6 }}>
              {scoreSub}
            </p>
            {/* Score bar */}
            <div
              style={{
                marginTop: 10,
                width: "100%",
                height: 6,
                borderRadius: 3,
                background: "rgba(127,119,221,0.1)",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: `${(dealScore / 10) * 100}%`,
                  height: "100%",
                  borderRadius: 3,
                  background: scoreColor,
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <div
              className="flex justify-between"
              style={{ fontSize: 10, color: "#3a3758", marginTop: 4 }}
            >
              <span>Weak</span>
              <span>Moderate</span>
              <span>Strong</span>
            </div>
          </div>
        </div>
      )}

      {/* Recommendation banner */}
      {result.recommendation && (
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
            style={{ fontSize: 14, color: "#1D9E75", lineHeight: 1.6 }}
          >
            <span
              className="mt-1.5 inline-block shrink-0 rounded-full"
              style={{ width: 7, height: 7, background: "#1D9E75" }}
            />
            {result.recommendation}
          </span>
          {model && (
            <p style={{ fontSize: 11, color: "#3a3758", marginTop: 4, marginLeft: 15 }}>
              Analysis by {model}
            </p>
          )}
        </div>
      )}

      {/* === SECTION B: Key Metrics Grid === */}
      {metrics.length > 0 && (
        <div
          className="mb-5 grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 10,
          }}
        >
          {metrics.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>
      )}

      {/* === SECTION C: Pro Forma === */}
      {isFlip && calc ? (
        <CardWrapper>
          <SectionLabel text="Pro Forma — Flip Waterfall" />
          <ProFormaRow label="Purchase Price" value={$(calc.purchasePrice ?? purchasePrice)} prefix="-" />
          {calc.acquisitionLoan != null && (
            <ProFormaRow label="Hard Money Loan" value={$(calc.acquisitionLoan)} prefix="+" />
          )}
          <ProFormaRow label="Rehab Cost" value={$(calc.renovationCosts ?? calc.rehabCost)} prefix="-" />
          {calc.rehabHoldback != null && calc.rehabHoldback > 0 && (
            <ProFormaRow label="Rehab Loan Draw" value={$(calc.rehabHoldback)} prefix="+" />
          )}
          <ProFormaRow label={`Interest (${calc.holdingMonths ?? '?'}mo)`} value={$(calc.holdingCosts)} prefix="-" />
          {calc.pointsCost != null && (
            <ProFormaRow label="Points" value={$(calc.pointsCost)} prefix="-" />
          )}
          <ProFormaRow label="Buy Closing Costs" value={$(calc.closingCosts)} prefix="-" />
          <ProFormaRow label="Total Cash Invested" value={$(calc.cashRequired)} bold />
          <div style={{ height: 1, background: "rgba(127,119,221,0.15)", margin: "4px 0" }} />
          <ProFormaRow label="Sale Price (ARV)" value={$(calc.arv)} prefix="+" />
          <ProFormaRow label="Sell Closing Costs" value={$(calc.sellingCosts)} prefix="-" />
          <div style={{ height: 1, background: "rgba(127,119,221,0.15)", margin: "4px 0" }} />
          <ProFormaRow label="NET PROFIT" value={$(calc.netProfit)} bold />
          <ProFormaRow label="ROI on Cash" value={pct(calc.roi)} bold isLast />
        </CardWrapper>
      ) : (
        // Generic pro forma for other strategies
        (() => {
          const rows: { label: string; value: string }[] = [];
          const ti = calc?.totalInvestment ?? fm?.total_investment;
          if (ti != null) rows.push({ label: "Total Investment", value: $(ti) });
          const rent = fm?.monthly_rent ?? v2m?.monthlyRent;
          if (rent != null) rows.push({ label: "Gross Rent", value: $(rent) + "/mo" });
          const noi = fm?.annual_noi ?? v2m?.noi;
          if (noi != null) rows.push({ label: "Net Operating Income", value: $(noi) + "/yr" });
          const holdCosts = fm?.holding_costs;
          if (holdCosts != null) rows.push({ label: "Holding Costs", value: $(holdCosts) });
          const profit = fm?.total_profit;
          if (profit != null) rows.push({ label: "Total Profit (5yr)", value: $(profit) });

          if (rows.length === 0) return null;

          return (
            <CardWrapper>
              <SectionLabel text="Pro Forma" />
              {rows.map((r, i) => (
                <ProFormaRow key={r.label} label={r.label} value={r.value} isLast={i === rows.length - 1} />
              ))}
            </CardWrapper>
          );
        })()
      )}

      {/* === SECTION D: Projection Chart === */}
      <TierGate tier={tier} requiredTier="pro" label="5-year projections available on Pro">
        <ProjectionChart strategy={strategy} calculations={calc} result={result} />
      </TierGate>

      {/* === SECTION E: Risk Flags === */}
      {riskItems.length > 0 && (
        <div className="mb-5">
          <SectionLabel text="Risk Flags" />
          {hasHighRisk && (
            <div
              style={{
                fontSize: 12,
                color: "#f09595",
                marginBottom: 10,
                background: "rgba(162,45,45,0.06)",
                borderLeft: "2px solid #f09595",
                padding: "8px 12px",
                borderRadius: "0 6px 6px 0",
              }}
            >
              High severity risk detected — review before proceeding
            </div>
          )}
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

      {/* === SECTION F: AI Narrative + Takeaways === */}
      <TierGate tier={tier} requiredTier="pro" label="Full AI narrative available on Pro">
        {(result.narrative || result.full_analysis || result.summary) && (
          <CardWrapper>
            <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
              <SectionLabel text="AI Analysis" />
              {model && (
                <span
                  style={{
                    background: "rgba(83,74,183,0.2)",
                    color: "#9994b8",
                    fontSize: 11,
                    borderRadius: 4,
                    padding: "2px 8px",
                  }}
                >
                  {model}
                </span>
              )}
            </div>
            <p
              style={{
                fontSize: 14,
                color: "#9994b8",
                lineHeight: 1.8,
                margin: 0,
                whiteSpace: "pre-wrap",
              }}
            >
              {result.narrative || result.full_analysis || result.summary || ""}
            </p>

            {/* Key Takeaways */}
            {takeaways.length > 0 && (
              <div style={{ marginTop: 12 }}>
                {takeaways.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2"
                    style={{
                      padding: "6px 0",
                      borderTop: i === 0 ? "0.5px solid rgba(127,119,221,0.08)" : "none",
                    }}
                  >
                    <span style={{ color: "#7F77DD", fontSize: 14, lineHeight: 1.6 }}>›</span>
                    <span style={{ fontSize: 13, color: "#9994b8", lineHeight: 1.6 }}>
                      {t}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardWrapper>
        )}
      </TierGate>

      {/* === SECTION G: Market Context === */}
      <TierGate tier={tier} requiredTier="pro" label="Market analysis available on Pro">
        {result.marketContext && (
          <CardWrapper>
            <SectionLabel text="Market Context" />
            <p style={{ fontSize: 14, color: "#9994b8", lineHeight: 1.8, margin: 0 }}>
              {result.marketContext}
            </p>
          </CardWrapper>
        )}
      </TierGate>

      {/* === SECTION I: Multi-Model Scaffold === */}
      {tier === "pro_max" && (
        <div
          style={{
            marginTop: 32,
            padding: "20px 22px",
            background: "#13121d",
            border: "0.5px solid rgba(127,119,221,0.15)",
            borderRadius: 12,
          }}
        >
          <div
            className="uppercase"
            style={{ fontSize: 11, letterSpacing: "1px", color: "#3C3489", marginBottom: 8 }}
          >
            Multi-Model Comparison
          </div>
          <p style={{ fontSize: 13, color: "#3a3758", margin: 0 }}>
            {/* TODO: Wire up in multi-model prompt */}
            Run same deal on multiple AI models to compare outputs — available when multi-model routing is enabled.
          </p>
        </div>
      )}
    </div>
  );
}
