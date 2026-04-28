"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UpgradeModalProps {
  tier: string;
}

export default function UpgradeModal({ tier }: UpgradeModalProps) {
  const [show, setShow] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (tier !== "free") return;

    const key = "upgrade_modal_shown";
    const shown = sessionStorage.getItem(key);
    if (!shown) {
      const timer = setTimeout(() => {
        setShow(true);
        sessionStorage.setItem(key, "1");
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [tier]);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(13,13,20,0.85)",
        backdropFilter: "blur(8px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "#13121d",
          border: "0.5px solid rgba(99,102,241,0.25)",
          borderRadius: 20,
          padding: "36px 32px",
          maxWidth: 520,
          width: "100%",
          position: "relative",
        }}
      >
        <button
          onClick={() => setShow(false)}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            color: "#4e4a6a",
            fontSize: 20,
            cursor: "pointer",
            lineHeight: 1,
            padding: 4,
          }}
        >
          &times;
        </button>

        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "#6366F1",
            marginBottom: 12,
          }}
        >
          You&apos;re on the free plan
        </div>

        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#f0eeff",
            letterSpacing: "-0.4px",
            lineHeight: 1.3,
            marginBottom: 8,
          }}
        >
          See what you&apos;re missing
        </h2>

        <p
          style={{
            fontSize: 14,
            color: "#6b6690",
            lineHeight: 1.7,
            marginBottom: 24,
          }}
        >
          Your free analyses show the score and key metrics. Here&apos;s what
          Pro unlocks on every deal.
        </p>

        <div
          style={{
            background: "rgba(99,102,241,0.06)",
            border: "0.5px solid rgba(99,102,241,0.15)",
            borderRadius: 12,
            padding: "20px",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "#6366F1",
              marginBottom: 14,
            }}
          >
            Pro &mdash; $29/mo
          </div>
          {[
            "✓ Unlimited analyses — no monthly cap",
            "✓ Full risk breakdown with severity ratings",
            "✓ Complete pro forma waterfall",
            "✓ AI narrative — full deal reasoning",
            "✓ 5-year cash flow projections",
            "✓ Auto model routing per strategy",
          ].map((item, i) => (
            <div
              key={i}
              style={{
                fontSize: 13,
                color: "#9994b8",
                marginBottom: 8,
                lineHeight: 1.5,
              }}
            >
              {item}
            </div>
          ))}
        </div>

        <div
          style={{
            background: "rgba(127,119,221,0.06)",
            border: "0.5px solid rgba(127,119,221,0.15)",
            borderRadius: 12,
            padding: "20px",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "#7F77DD",
              marginBottom: 14,
            }}
          >
            Pro Max &mdash; $79/mo
          </div>
          {[
            "✓ Everything in Pro",
            "✓ Max IQ — 3 AI models run simultaneously",
            "✓ The Skeptic, Sponsor & Quant side by side",
            "✓ Multi-model comparison view",
          ].map((item, i) => (
            <div
              key={i}
              style={{
                fontSize: 13,
                color: "#9994b8",
                marginBottom: 8,
                lineHeight: 1.5,
              }}
            >
              {item}
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push("/v2/pricing")}
          style={{
            width: "100%",
            background: "#6366F1",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "14px",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 10,
          }}
        >
          Start 7-day free trial &rarr;
        </button>

        <button
          onClick={() => setShow(false)}
          style={{
            width: "100%",
            background: "none",
            border: "none",
            color: "#4e4a6a",
            fontSize: 13,
            cursor: "pointer",
            padding: "8px",
          }}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
