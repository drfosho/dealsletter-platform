"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import NavBar from "@/components/v2/NavBar";
import Hero from "@/components/v2/Hero";
import AnalysisCard from "@/components/v2/AnalysisCard";
import StrategyGrid from "@/components/v2/StrategyGrid";
import PricingSection from "@/components/v2/PricingSection";

export default function V2Page() {
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          router.replace("/v2/dashboard");
          return;
        }

        setAuthChecked(true);
      } catch {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [router]);

  if (!authChecked) {
    return (
      <div
        style={{
          background: "#0d0d14",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <style>{`
          @keyframes v2-landing-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(0.75); }
          }
        `}</style>
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#534AB7",
            animation: "v2-landing-pulse 1s infinite",
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ backgroundColor: "#0d0d14" }}>
      <NavBar />
      <Hero isLoggedIn={false} />
      <AnalysisCard />
      <StrategyGrid />
      <PricingSection />

      {/* Footer */}
      <footer
        className="flex items-center justify-between"
        style={{
          padding: "24px 44px",
          borderTop: "0.5px solid rgba(127,119,221,0.08)",
        }}
      >
        <span style={{ fontSize: 12, color: "#2e2c48" }}>
          © 2026 Dealsletter · dealsletter.io
        </span>
        <span style={{ fontSize: 12, color: "#2e2c48" }}>
          Privacy · Terms
        </span>
      </footer>
    </div>
  );
}
