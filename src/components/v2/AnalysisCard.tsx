"use client";

const metrics = [
  { label: "Cap Rate", value: "6.8%", color: "#f0eeff" },
  { label: "Cash-on-Cash", value: "9.2%", color: "#7F77DD" },
  { label: "Monthly Cash Flow", value: "+$612", color: "#1D9E75" },
  { label: "5-Year ROI", value: "54%", color: "#f0eeff" },
] as const;

export default function AnalysisCard() {
  return (
    <div className="analysis-card-section" style={{ maxWidth: 780, margin: "0 auto", padding: "20px 40px 60px" }}>
      <style>{`
        .metrics-grid {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
        }
        @media (max-width: 768px) {
          .analysis-card-section {
            padding: 16px 16px 32px !important;
          }
          .analysis-card-header {
            flex-direction: column !important;
            gap: 10px !important;
          }
          .analysis-card-footer {
            flex-direction: column !important;
            gap: 8px !important;
            align-items: flex-start !important;
          }
          .analysis-card-footer .ml-auto {
            margin-left: 0 !important;
          }
          .metrics-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
          }
          .metrics-grid > div {
            padding: 14px 16px !important;
          }
          .metric-value {
            font-size: 20px !important;
          }
        }
      `}</style>
      {/* Eyebrow */}
      <p
        className="uppercase"
        style={{
          fontSize: 12,
          letterSpacing: "1.5px",
          color: "#3C3489",
          marginBottom: 18,
        }}
      >
        Sample analysis output
      </p>

      {/* Card */}
      <div
        className="overflow-hidden"
        style={{
          background: "#13121d",
          border: "0.5px solid rgba(127,119,221,0.2)",
          borderRadius: 16,
          opacity: 1,
          transform: "translateY(0)",
        }}
      >
        {/* Header */}
        <div
          className="analysis-card-header flex items-start justify-between"
          style={{
            padding: "22px 26px",
            borderBottom: "0.5px solid rgba(127,119,221,0.1)",
          }}
        >
          <div>
            <p
              style={{
                fontSize: 17,
                fontWeight: 600,
                color: "#e8e6f0",
                letterSpacing: "-0.2px",
                margin: 0,
              }}
            >
              742 Maple Street, Oakland CA 94612
            </p>
            <p style={{ fontSize: 13, color: "#4e4a6a", margin: "4px 0 0" }}>
              3 bd · 2 ba · 1,450 sqft · Est. value $610,000
            </p>
          </div>

          <span
            className="shrink-0"
            style={{
              background: "rgba(83,74,183,0.2)",
              border: "0.5px solid rgba(127,119,221,0.35)",
              borderRadius: 6,
              padding: "5px 13px",
              fontSize: 12,
              color: "#9994b8",
              whiteSpace: "nowrap",
            }}
          >
            Buy &amp; Hold
          </span>
        </div>

        {/* Metrics grid */}
        <div
          className="metrics-grid grid"
        >
          {metrics.map((m, i) => (
            <div
              key={m.label}
              style={{
                padding: "22px 26px",
                borderRight:
                  i % 2 === 0
                    ? "0.5px solid rgba(127,119,221,0.1)"
                    : "none",
                borderBottom:
                  i < 2
                    ? "0.5px solid rgba(127,119,221,0.1)"
                    : "none",
              }}
            >
              <p
                className="uppercase"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.8px",
                  color: "#3a3758",
                  margin: "0 0 10px",
                }}
              >
                {m.label}
              </p>
              <p
                className="metric-value"
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  letterSpacing: "-0.5px",
                  color: m.color,
                  margin: 0,
                }}
              >
                {m.value}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="analysis-card-footer flex items-center"
          style={{
            padding: "16px 26px",
            gap: 8,
            borderTop: "0.5px solid rgba(127,119,221,0.1)",
          }}
        >
          <span
            className="shrink-0 rounded-full"
            style={{ width: 7, height: 7, background: "#1D9E75" }}
          />
          <span style={{ fontSize: 13, color: "#1D9E75" }}>
            Above-average returns for Oakland market — strong buy signal
          </span>

          <span
            className="ml-auto flex shrink-0 items-center"
            style={{ gap: 6 }}
          >
            <span
              className="rounded-full"
              style={{ width: 9, height: 9, background: "#534AB7" }}
            />
            <span style={{ fontSize: 12, color: "#3a3758" }}>
              Powered by Claude Sonnet (Auto)
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
