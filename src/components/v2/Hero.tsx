import SearchBar from "@/components/v2/SearchBar";

export default function Hero({ isLoggedIn }: { isLoggedIn?: boolean }) {
  return (
    <section className="hero-section relative overflow-hidden" style={{ backgroundColor: "#0d0d14" }}>
      <style>{`
        @keyframes v2-pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.75); }
        }
        @media (max-width: 768px) {
          .hero-section {
            min-height: auto !important;
          }
          .hero-content {
            padding-top: 48px !important;
            padding-bottom: 40px !important;
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
          .hero-badge {
            margin-bottom: 24px !important;
          }
          .hero-glow {
            width: 300px !important;
            height: 200px !important;
            opacity: 0.5 !important;
          }
        }
        @media (max-width: 390px) {
          .hero-content {
            padding-top: 36px !important;
          }
        }
      `}</style>

      {/* Dot-grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(127,119,221,0.14) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      {/* Purple glow behind headline */}
      <div
        className="hero-glow pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "700px",
          height: "500px",
          background:
            "radial-gradient(ellipse at center, rgba(127,119,221,0.18) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="hero-content relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 pb-20 pt-28 text-center">
        {/* Badge */}
        <div
          className="hero-badge mb-10 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm"
          style={{
            borderColor: "rgba(127,119,221,0.3)",
            backgroundColor: "rgba(127,119,221,0.08)",
            color: "#c4bfef",
          }}
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{
              backgroundColor: "#7F77DD",
              animation: "v2-pulse-dot 2s ease-in-out infinite",
            }}
          />
          Multi-model AI property analysis — now in beta
        </div>

        {/* Headline */}
        <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
          <span className="text-white">Analyze any</span>
          <br />
          <span style={{ color: "#7F77DD" }}>real estate deal.</span>
          <br />
          <span
            className="text-3xl font-semibold sm:text-4xl lg:text-5xl"
            style={{ color: "#9994b8" }}
          >
            With every leading AI model.
          </span>
        </h1>

        {/* Subheading */}
        <p
          className="mx-auto mt-7 max-w-xl text-lg leading-relaxed"
          style={{ color: "#9994b8" }}
        >
          Stop copy-pasting property addresses into ChatGPT. Enter any address.
          Get cap rate, cash flow &amp; ROI in 30&nbsp;seconds.
        </p>

        {/* Search bar placeholder */}
        <div className="mt-10 w-full">
          <SearchBar userTier={null} />
        </div>

        {/* Hint text */}
        <p className="mt-4" style={{ color: "#6b6888", fontSize: 14 }}>
          {isLoggedIn ? (
            "Enter any property address to run your analysis"
          ) : (
            <>
              <span style={{ color: "#7F77DD" }}>Free to start</span> — no
              account needed for your first property analysis
            </>
          )}
        </p>

        {/* Proof strip */}
        <div
          className="mt-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-2"

          style={{ color: "#7a7693", fontSize: 14 }}
        >
          <span>10,000+ properties analyzed</span>
          <span style={{ color: "#7F77DD" }}>·</span>
          <span>BRRRR · Fix &amp; Flip · Buy &amp; Hold · House Hack</span>
          <span style={{ color: "#7F77DD" }}>·</span>
          <span>Results in under 30 seconds</span>
        </div>
      </div>
    </section>
  );
}
