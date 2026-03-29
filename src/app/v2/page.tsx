import NavBar from "@/components/v2/NavBar";
import Hero from "@/components/v2/Hero";
import AnalysisCard from "@/components/v2/AnalysisCard";
import StrategyGrid from "@/components/v2/StrategyGrid";
import PricingSection from "@/components/v2/PricingSection";

export default function V2Page() {
  return (
    <div className="flex flex-col" style={{ backgroundColor: "#0d0d14" }}>
      <NavBar />
      <Hero />
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
