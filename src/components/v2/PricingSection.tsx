"use client";

import { useEffect, useRef, useState } from "react";

type FeatureStyle = "check" | "partial" | "excluded";

interface Feature {
  text: string;
  style: FeatureStyle;
  badge?: string;
}

interface Tier {
  badge?: string;
  name: string;
  price: string;
  annualNote?: string;
  modelLabel: string;
  features: Feature[];
  note: string;
  cta: string;
  featured?: boolean;
}

const tiers: Tier[] = [
  {
    name: "Free",
    price: "$0",
    modelLabel: "Speed model only",
    features: [
      { text: "Property data pull on any address", style: "check" },
      { text: "3 analyses per month", style: "check" },
      { text: "All 4 investment strategies", style: "check" },
      { text: "Risk flags & AI narrative blurred", style: "partial" },
      { text: "No PDF export or saved history", style: "excluded" },
      { text: "No model selection", style: "excluded" },
    ],
    note: "You\u2019ll see the numbers. The insights that tell you whether to act are unlocked with Pro.",
    cta: "Get started free",
  },
  {
    badge: "Most popular",
    name: "Pro",
    price: "$29",
    annualNote: "$290/year \u2014 2 months free",
    modelLabel: "Balanced model \u2014 Claude Sonnet / GPT-4.1",
    features: [
      { text: "Unlimited analyses \u2014 no caps", style: "check" },
      { text: "Full results \u2014 no blur, no gates", style: "check" },
      { text: "Auto model routing per strategy", style: "check" },
      { text: "All 4 strategies", style: "check" },
      { text: "Save history + PDF & Excel export", style: "check" },
      { text: "Speed model available for faster runs", style: "check" },
    ],
    note: "One good deal analysis pays for a full year of this subscription.",
    cta: "Start Pro \u2014 7 days free",
    featured: true,
  },
  {
    name: "Pro Max",
    price: "$79",
    annualNote: "$790/year \u2014 2 months free",
    modelLabel: "Max IQ model \u2014 Claude Opus / GPT-4o / Grok 3",
    features: [
      { text: "Everything in Pro", style: "check" },
      { text: "Max IQ model access", style: "check" },
      { text: "Multi-model comparison view", style: "check", badge: "Exclusive" },
      { text: "Priority queue \u2014 faster response times", style: "check" },
      { text: "Early access to new features", style: "check" },
    ],
    note: "The only tool that lets you run the same deal through multiple AI models and compare results side by side.",
    cta: "Get Pro Max",
  },
];

export default function PricingSection() {
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
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="pricing-home-section w-full text-center"
      style={{ padding: "20px 44px 64px" }}
    >
      <style>{`
        @media (max-width: 768px) {
          .pricing-home-grid {
            grid-template-columns: 1fr !important;
          }
          .pricing-home-section {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
          .pricing-home-heading {
            font-size: 24px !important;
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
        Pricing
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
        className="pricing-home-heading"
      >
        Start free. Upgrade your AI when you&apos;re ready.
      </h2>

      {/* Subheading */}
      <p style={{ fontSize: 15, color: "#4e4a6a", marginBottom: 36 }}>
        We gate by model quality — not analysis count. The more you invest, the
        smarter your underwriting.
      </p>

      {/* Grid */}
      <div
        className="pricing-home-grid mx-auto grid"
        style={{
          maxWidth: 740,
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
        }}
      >
        {tiers.map((tier, i) => (
          <div
            key={tier.name}
            className="flex flex-col text-left"
            style={{
              background: tier.featured ? "#191728" : "#13121d",
              border: tier.featured
                ? "0.5px solid rgba(127,119,221,0.55)"
                : "0.5px solid rgba(127,119,221,0.15)",
              borderRadius: 14,
              padding: "26px 22px",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: `opacity 0.45s ease ${i * 100}ms, transform 0.45s ease ${i * 100}ms`,
            }}
          >
            {/* Badge */}
            {tier.badge && (
              <span
                className="mb-2.5 inline-block self-start"
                style={{
                  background: "rgba(83,74,183,0.3)",
                  color: "#9994b8",
                  borderRadius: 5,
                  padding: "3px 10px",
                  fontSize: 11,
                }}
              >
                {tier.badge}
              </span>
            )}

            {/* Name */}
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#d8d4f4",
                margin: 0,
              }}
            >
              {tier.name}
            </p>

            {/* Price */}
            <p style={{ margin: "8px 0 3px" }}>
              <span
                style={{
                  fontSize: 30,
                  fontWeight: 700,
                  color: "#f0eeff",
                  letterSpacing: "-0.8px",
                }}
              >
                {tier.price}
              </span>
              <span style={{ fontSize: 13, fontWeight: 400, color: "#3a3758" }}>
                /mo
              </span>
            </p>

            {/* Annual note */}
            {tier.annualNote && (
              <p style={{ fontSize: 11, color: "#534AB7", margin: "0 0 3px" }}>
                {tier.annualNote}
              </p>
            )}

            {/* Model label */}
            <p style={{ fontSize: 13, color: "#534AB7", marginBottom: 18 }}>
              {tier.modelLabel}
            </p>

            {/* Features */}
            <div>
              {tier.features.map((f) => (
                <div
                  key={f.text}
                  className="flex items-start gap-2"
                  style={{ padding: "4px 0" }}
                >
                  {f.style === "check" && (
                    <span
                      className="shrink-0"
                      style={{ color: "#1D9E75", fontSize: 13 }}
                    >
                      ✓
                    </span>
                  )}
                  {f.style === "partial" && (
                    <span
                      className="shrink-0"
                      style={{ color: "#6b5f2e", fontSize: 13 }}
                    >
                      ~
                    </span>
                  )}
                  {f.style === "excluded" && (
                    <span
                      className="shrink-0"
                      style={{ color: "#2e2c48", fontSize: 13 }}
                    >
                      —
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: 13,
                      color:
                        f.style === "check"
                          ? "#4a4668"
                          : f.style === "partial"
                            ? "#6b5f2e"
                            : "#2e2c48",
                    }}
                  >
                    {f.text}
                    {f.badge && (
                      <span
                        className="ml-1.5 inline-block"
                        style={{
                          background: "rgba(83,74,183,0.25)",
                          color: "#9994b8",
                          borderRadius: 4,
                          padding: "2px 7px",
                          fontSize: 10,
                          verticalAlign: "middle",
                        }}
                      >
                        {f.badge}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* Note */}
            <p
              style={{
                fontSize: 11,
                fontStyle: "italic",
                color: "#3a3758",
                marginTop: 10,
                lineHeight: 1.5,
              }}
            >
              {tier.note}
            </p>

            {/* CTA — pushed to bottom */}
            <div className="mt-auto" style={{ paddingTop: 20 }}>
              {tier.featured ? (
                <button
                  className="w-full cursor-pointer transition-colors"
                  style={{
                    padding: 10,
                    background: "#534AB7",
                    border: "none",
                    borderRadius: 8,
                    color: "#f0eeff",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#6258cc")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#534AB7")
                  }
                >
                  {tier.cta}
                </button>
              ) : (
                <button
                  className="w-full cursor-pointer transition-colors"
                  style={{
                    padding: 10,
                    background: "transparent",
                    border: "0.5px solid rgba(127,119,221,0.3)",
                    borderRadius: 8,
                    color: "#9994b8",
                    fontSize: 14,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(127,119,221,0.6)";
                    e.currentTarget.style.color = "#c0baf0";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(127,119,221,0.3)";
                    e.currentTarget.style.color = "#9994b8";
                  }}
                >
                  {tier.cta}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p style={{ marginTop: 24, fontSize: 13, color: "#2e2c48" }}>
        All plans include a 7-day free trial. No credit card required to start.
      </p>
    </section>
  );
}
