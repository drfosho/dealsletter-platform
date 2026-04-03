"use client";

import { useEffect, useRef, useState } from "react";

const strategies = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7F77DD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" />
        <polyline points="23 20 23 14 17 14" />
        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
      </svg>
    ),
    name: "BRRRR",
    description:
      "Buy, rehab, rent, refi, repeat. Full equity capture & refi waterfall analysis.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7F77DD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    name: "Fix & Flip",
    description:
      "ARV, rehab budget, holding costs & net profit margin. Know your numbers before you bid.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7F77DD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    name: "Buy & Hold",
    description:
      "Long-term cash flow, cap rate & appreciation model. Built for the patient investor.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7F77DD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    name: "House Hack",
    description:
      "Live-in rental math. Offset your mortgage with ADU or multi-unit rental income.",
  },
] as const;

export default function StrategyGrid() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="strategy-home-section w-full text-center"
      style={{ padding: "10px 44px 64px" }}
    >
      <style>{`
        @media (max-width: 768px) {
          .strategy-home-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .strategy-home-section {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
          .strategy-home-heading {
            font-size: 24px !important;
          }
        }
        @media (max-width: 390px) {
          .strategy-home-grid {
            grid-template-columns: 1fr !important;
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
          marginBottom: 14,
        }}
      >
        Investment strategies
      </p>

      {/* Heading */}
      <h2
        style={{
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: "-0.5px",
          color: "#f0eeff",
          marginBottom: 8,
        }}
        className="strategy-home-heading"
      >
        Built for every real estate playbook
      </h2>

      {/* Subheading */}
      <p
        style={{
          fontSize: 15,
          color: "#4e4a6a",
          marginBottom: 36,
        }}
      >
        Each strategy runs a tailored AI model and financial underwriting formula
        — no prompting required.
      </p>

      {/* Grid */}
      <div
        className="strategy-home-grid mx-auto grid"
        style={{
          maxWidth: 900,
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
        }}
      >
        {strategies.map((s, i) => (
          <div
            key={s.name}
            className="cursor-pointer text-left"
            style={{
              background: "#13121d",
              border: "0.5px solid rgba(127,119,221,0.15)",
              borderRadius: 12,
              padding: "26px 22px",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: `opacity 0.45s ease ${i * 80}ms, transform 0.45s ease ${i * 80}ms, border-color 0.2s`,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "rgba(127,119,221,0.4)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "rgba(127,119,221,0.15)")
            }
          >
            <div style={{ marginBottom: 14 }}>{s.icon}</div>
            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#d8d4f4",
                marginBottom: 6,
              }}
            >
              {s.name}
            </p>
            <p
              style={{
                fontSize: 13,
                color: "#4a4668",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {s.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
