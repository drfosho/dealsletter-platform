"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import NavBar from "@/components/v2/NavBar";
import Footer from "@/components/v2/Footer";
import Hero from "@/components/v2/Hero";
import AnalysisCard from "@/components/v2/AnalysisCard";
import StrategyGrid from "@/components/v2/StrategyGrid";
import PricingSection from "@/components/v2/PricingSection";

export default function V2Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session?.user);
    });
  }, []);

  return (
    <div className="flex flex-col" style={{ backgroundColor: "#0d0d14" }}>
      <NavBar />
      <Hero isLoggedIn={isLoggedIn} />
      <AnalysisCard />
      <StrategyGrid />
      <PricingSection />

      <Footer />
    </div>
  );
}
