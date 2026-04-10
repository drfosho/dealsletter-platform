"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import NavBar from "@/components/v2/NavBar";
import Footer from "@/components/v2/Footer";
import Hero from "@/components/v2/Hero";
import AnalysisCard from "@/components/v2/AnalysisCard";
import StrategyGrid from "@/components/v2/StrategyGrid";
import PricingSection from "@/components/v2/PricingSection";

export default function V2Page() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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

      {!isMobile && <AnalysisCard />}
      {!isMobile && <StrategyGrid />}
      {!isMobile && <PricingSection />}

      {isMobile && (
        <div style={{
          padding: '0 20px 48px',
          backgroundColor: '#0d0d14'
        }}>

          {/* How it works card */}
          <div
            onClick={() => router.push('/v2/how-it-works')}
            style={{
              background: '#13121d',
              border: '0.5px solid rgba(127,119,221,0.2)',
              borderRadius: 14,
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              marginBottom: 10
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14
            }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'rgba(83,74,183,0.15)',
                border: '0.5px solid rgba(127,119,221,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7F77DD" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e8e6f0', marginBottom: 2 }}>
                  How it works
                </div>
                <div style={{ fontSize: 12, color: '#4e4a6a' }}>
                  See how we analyze deals in 30 seconds
                </div>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>

          {/* Strategies card */}
          <div
            onClick={() => router.push('/v2/strategies')}
            style={{
              background: '#13121d',
              border: '0.5px solid rgba(127,119,221,0.2)',
              borderRadius: 14,
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              marginBottom: 10
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14
            }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'rgba(83,74,183,0.15)',
                border: '0.5px solid rgba(127,119,221,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7F77DD" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e8e6f0', marginBottom: 2 }}>
                  Investment strategies
                </div>
                <div style={{ fontSize: 12, color: '#4e4a6a' }}>
                  BRRRR · Fix &amp; Flip · Buy &amp; Hold · House Hack
                </div>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>

          {/* Pricing card */}
          <div
            onClick={() => router.push('/v2/pricing')}
            style={{
              background: '#13121d',
              border: '0.5px solid rgba(127,119,221,0.2)',
              borderRadius: 14,
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              marginBottom: 24
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14
            }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'rgba(83,74,183,0.15)',
                border: '0.5px solid rgba(127,119,221,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7F77DD" strokeWidth="2" strokeLinecap="round">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e8e6f0', marginBottom: 2 }}>
                  Pricing
                </div>
                <div style={{ fontSize: 12, color: '#4e4a6a' }}>
                  Free · Pro $29 · Pro Max $79
                </div>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>

          {/* Sign up CTA */}
          <button
            onClick={() => router.push('/v2/signup')}
            style={{
              width: '100%',
              background: '#534AB7',
              color: '#f0eeff',
              border: 'none',
              borderRadius: 12,
              padding: '15px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: 10,
              fontFamily: 'inherit',
              letterSpacing: '-0.2px'
            }}
          >
            Create free account &rarr;
          </button>

          <button
            onClick={() => router.push('/v2/login')}
            style={{
              width: '100%',
              background: 'transparent',
              color: '#9994b8',
              border: '0.5px solid rgba(127,119,221,0.25)',
              borderRadius: 12,
              padding: '15px',
              fontSize: 15,
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            Sign in
          </button>

        </div>
      )}

      <Footer />
    </div>
  );
}
