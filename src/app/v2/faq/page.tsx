"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/v2/NavBar";
import Footer from "@/components/v2/Footer";

/* ------------------------------------------------------------------ */
/*  FAQ data                                                           */
/* ------------------------------------------------------------------ */

const faqs = [
  // GETTING STARTED
  {
    category: "Getting Started",
    question: "Do I need an account to use Dealsletter?",
    answer:
      "No. You can run your first property analysis without creating an account. Just enter any US address on the homepage and we\u2019ll pull the property data and run a full AI analysis.\n\nYou\u2019ll need to create a free account to save your analysis history and run additional analyses.",
  },
  {
    category: "Getting Started",
    question: "How does Dealsletter work?",
    answer:
      "It\u2019s a simple four-step process:\n\n1. Enter any US property address\n2. We pull live data from RentCast \u2014 property details, AVM value, rental estimates, and comparable sales\n3. You select your investment strategy (BRRRR, Fix & Flip, Buy & Hold, or House Hack) and enter your deal numbers\n4. Our AI runs a full financial analysis and returns cap rate, cash flow, ROI, risk flags, and a deal score\n\nThe whole process takes under 30 seconds.",
  },
  {
    category: "Getting Started",
    question: "What property types does Dealsletter support?",
    answer:
      "Dealsletter works best with residential investment properties \u2014 single family homes, duplexes, triplexes, fourplexes, and small multifamily properties up to around 10 units.\n\nFor multifamily properties, we support per-unit rent roll editing so you can set different rents for each unit rather than using a single average.\n\nWe do not currently support commercial properties, large apartment complexes, or vacation rentals (short-term rental analysis coming soon).",
  },
  {
    category: "Getting Started",
    question: "Where does the property data come from?",
    answer:
      "All property data comes from RentCast, a professional real estate data provider. For each address we pull:\n\n\u2022 AVM (Automated Valuation Model) \u2014 estimated market value\n\u2022 Rental estimates \u2014 market rent based on local comparables\n\u2022 Sale comparables \u2014 recent sales in the area\n\u2022 Property details \u2014 beds, baths, square footage, year built\n\u2022 Market data \u2014 zip code level market statistics\n\nData accuracy depends on market coverage. Major metros have excellent coverage. Rural markets may have limited comparable data.",
  },

  // ANALYSIS
  {
    category: "Analysis",
    question: "What investment strategies does Dealsletter support?",
    answer:
      "We support four investment strategies, each with its own financial model and AI prompt:\n\nBRRRR (Buy, Rehab, Rent, Refi, Repeat) \u2014 Full two-phase analysis including hard money acquisition, rehab funding, DSCR refinance at 75% ARV, and cash-out calculation.\n\nFix & Flip \u2014 Full deal waterfall including hard money loan, rehab costs, holding period analysis, and profit sensitivity modeling.\n\nBuy & Hold \u2014 Complete expense stack including vacancy, maintenance, management, CapEx reserve, taxes, and insurance. Cap rate, cash-on-cash, and 30-year wealth projection.\n\nHouse Hack \u2014 FHA or conventional financing, per-unit rent roll, effective monthly cost vs renting comparison.",
  },
  {
    category: "Analysis",
    question: "How accurate are the analyses?",
    answer:
      "Accuracy depends on two things: data quality and your inputs.\n\nThe financial calculations are precise \u2014 we pre-compute every number server-side before sending to the AI, so the math is always correct based on the inputs provided.\n\nThe AI interpretation and market context depend on the quality of RentCast data for your specific market. Major metros with lots of recent sales will have better comp data than rural markets.\n\nAlways treat our analysis as a starting point for due diligence, not a substitute for it. Verify key assumptions \u2014 especially ARV and rent estimates \u2014 against your own research before committing capital.",
  },
  {
    category: "Analysis",
    question: "Can I edit the property data before running analysis?",
    answer:
      "Yes \u2014 and we encourage it. After we pull property data, you see a full editable property card before running your analysis. You can correct beds, baths, square footage, AVM value, and rental estimates if anything looks off.\n\nFor multifamily properties, you can edit rent on a per-unit basis rather than using a single average. This lets you model properties with mixed unit types accurately.\n\nAny edits you make override the RentCast data and flow through to the AI analysis, so the model gets your corrected numbers.",
  },
  {
    category: "Analysis",
    question: "What is a deal score?",
    answer:
      "The deal score is a 1-10 rating the AI assigns based on the quantitative metrics of your specific analysis. It is not a generic rating \u2014 it reflects the actual numbers.\n\n8-10: Strong deal \u2014 above-average returns for this market\n5-7: Moderate deal \u2014 acceptable returns with notable risk factors\n1-4: Weak deal \u2014 below-average returns or significant red flags\n\nOn Pro Max, you get three independent deal scores from Claude Opus, GPT-4o, and Grok 3. The variance between scores is itself useful information \u2014 high variance means the models disagree, which is a signal to dig deeper.",
  },
  {
    category: "Analysis",
    question: "Can I save and revisit my analyses?",
    answer:
      "Yes, on paid plans (Pro and Pro Max) your analyses are automatically saved to your account history. You can access them anytime from your dashboard.\n\nFree accounts can view analyses during the current session but history is not permanently saved.\n\nFrom your history you can re-open any past analysis, view the full results, and compare properties side by side.",
  },
  {
    category: "Analysis",
    question: "Can I export my analysis?",
    answer:
      "PDF and Excel export are available on Pro and Pro Max plans.\n\nThe PDF export includes the full analysis \u2014 all metrics, pro forma, risk flags, AI narrative, and projections \u2014 formatted for sharing with partners, lenders, or your own records.\n\nExcel export gives you the raw numbers in a spreadsheet you can modify with your own assumptions.",
  },

  // AI MODELS
  {
    category: "AI Models",
    question: 'What is "Auto" model routing?',
    answer:
      "On the Pro plan, we automatically select the best AI model for your investment strategy rather than using one model for everything.\n\nBRRRR and Buy & Hold run on Claude Sonnet 4.6 \u2014 these strategies require deep contextual reasoning around refinance scenarios, long-term hold logic, and risk layering that Claude handles best.\n\nFix & Flip and House Hack run on GPT-4.1 \u2014 these strategies benefit from clean, investor-friendly financial prose that GPT-4.1 excels at.\n\nYou never have to think about this. We pick the right model and you get the best analysis for your strategy.",
  },
  {
    category: "AI Models",
    question: "What makes Pro Max different from Pro?",
    answer:
      "Pro Max runs your analysis through three AI models simultaneously, each with a different analytical role:\n\nClaude Opus 4.6 acts as the Risk Analyst \u2014 conservative, stress-tests assumptions, identifies what can go wrong, gives you the bear case.\n\nGPT-4o acts as the Deal Sponsor \u2014 makes the investment thesis, articulates the upside case, writes like an investor memo you would share with a partner.\n\nGrok 3 acts as the Quantitative Model \u2014 pure math, verifies calculations, runs sensitivity analysis, benchmarks returns against market standards.\n\nYou see all three results side by side and can click into any model for the full analysis. The variance between their deal scores is itself valuable \u2014 it tells you how much consensus exists on the deal.",
  },
  {
    category: "AI Models",
    question: "Why do the three Pro Max models give different deal scores?",
    answer:
      "That is the feature, not a bug.\n\nEach model has a different analytical lens. Claude Opus is intentionally conservative \u2014 it scores from the downside case. GPT-4o scores from the opportunity perspective. Grok 3 scores purely on quantitative benchmarks.\n\nA deal that scores 4/10 from Opus but 8/10 from GPT-4o is a high-upside, high-risk deal. A deal that scores 7/10 from all three has strong consensus.\n\nThe spread between scores is signal. Wide spread means proceed carefully. Tight consensus means the models agree on the deal quality.",
  },
  {
    category: "AI Models",
    question: "Do you use ChatGPT?",
    answer:
      "We use OpenAI\u2019s GPT-4o-mini on the Free plan and GPT-4.1 and GPT-4o on Pro and Pro Max plans. These are the same underlying models that power ChatGPT, but accessed directly via API with our own specialized real estate prompts and financial calculation layer on top.\n\nThe difference between using Dealsletter and copy-pasting into ChatGPT is significant \u2014 we pre-compute all the financial math server-side, inject live RentCast property data, and use strategy-specific prompts built for real estate underwriting. You get the power of these models without any of the prompting work.",
  },

  // BILLING
  {
    category: "Billing",
    question: "Is the Free plan actually free?",
    answer:
      "Yes, completely free with no credit card required. The Free plan gives you unlimited analyses on our Speed model (GPT-4o-mini) with all four investment strategies.\n\nThe difference from paid plans is model quality and full results access. Free analyses show all the key financial metrics but blur the AI narrative and risk flags \u2014 the parts that tell you what to do with the numbers.",
  },
  {
    category: "Billing",
    question: "What is included in the 7-day free trial?",
    answer:
      "When you start a Pro or Pro Max trial you get full access to everything in that plan for 7 days with no charge. No credit card is required to start the trial.\n\nAt the end of 7 days you can subscribe to continue access or let the trial expire and stay on the Free plan. You will never be charged without explicitly confirming a subscription.",
  },
  {
    category: "Billing",
    question: "Can I switch plans anytime?",
    answer:
      "Yes. You can upgrade, downgrade, or cancel at any time from your account settings.\n\nIf you upgrade mid-cycle you are charged the prorated difference for the remainder of your billing period.\n\nIf you downgrade, your current plan stays active until the end of the billing period. You won\u2019t lose access immediately.",
  },
  {
    category: "Billing",
    question: "Is annual billing worth it?",
    answer:
      "Annual billing saves you the equivalent of 2 months \u2014 you pay for 10 months and get 12.\n\nPro annual: $290/year vs $348 monthly ($58 savings)\nPro Max annual: $790/year vs $948 monthly ($158 savings)\n\nIf you plan to use Dealsletter regularly, annual billing is worth it. If you\u2019re not sure, start monthly and switch to annual when you\u2019re confident.",
  },
  {
    category: "Billing",
    question: "Do you offer refunds?",
    answer:
      "We offer a 7-day free trial on all paid plans so you can evaluate the product before committing. Outside of that we do not offer refunds on subscription charges.\n\nIf you have an issue with your account or feel the product did not deliver value, reach out at support@dealsletter.io and we will work something out. We would rather fix the problem than lose a subscriber.",
  },

  // ACCOUNT
  {
    category: "Account",
    question: "How do I manage my subscription?",
    answer:
      "From your account page, click \u201CManage Billing\u201D to open the Stripe customer portal. From there you can update your payment method, view invoices, change plans, or cancel your subscription.\n\nAll billing is handled through Stripe \u2014 we never store your payment information directly.",
  },
  {
    category: "Account",
    question: "What happens to my data if I cancel?",
    answer:
      "Your account and all saved analyses remain in our system for 90 days after cancellation in case you want to reactivate. After 90 days your data is permanently deleted per our privacy policy.\n\nYou can export your analysis history as a PDF or Excel file at any time before cancelling on a paid plan.",
  },
  {
    category: "Account",
    question: "How do I delete my account?",
    answer:
      'To permanently delete your account and all associated data, email privacy@dealsletter.io with the subject line "Account Deletion Request" from the email address associated with your account.\n\nWe will process your request within 7 business days and send a confirmation when complete.',
  },
  {
    category: "Account",
    question: "Can I use Dealsletter on mobile?",
    answer:
      "Yes. Dealsletter is fully responsive and works on mobile browsers. The analysis flow, property search, and results pages are all designed to work on smaller screens.\n\nFor the best experience analyzing deals with detailed pro formas and projection charts, a desktop or tablet is recommended.",
  },
];

const categories = [
  "All",
  "Getting Started",
  "Analysis",
  "AI Models",
  "Billing",
  "Account",
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function V2FaqPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [openItem, setOpenItem] = useState<number | null>(null);
  const router = useRouter();

  const filtered =
    activeCategory === "All"
      ? faqs
      : faqs.filter((f) => f.category === activeCategory);

  return (
    <div
      style={{
        background: "#0d0d14",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(127,119,221,0.07) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <NavBar />

      <main
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 760,
          margin: "0 auto",
          padding: "72px 24px 80px",
          flex: 1,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              color: "#3C3489",
              marginBottom: 14,
            }}
          >
            FAQ
          </p>
          <h1
            style={{
              fontSize: 42,
              fontWeight: 700,
              color: "#f0eeff",
              letterSpacing: "-1.2px",
              marginBottom: 12,
              marginTop: 0,
            }}
          >
            Questions, answered.
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "#4e4a6a",
              marginBottom: 56,
            }}
          >
            Everything you need to know about Dealsletter and how it works.
          </p>
        </div>

        {/* Category filter */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setOpenItem(null);
              }}
              style={{
                padding: "7px 18px",
                borderRadius: 20,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.15s",
                fontFamily: "inherit",
                background:
                  activeCategory === cat
                    ? "rgba(83,74,183,0.25)"
                    : "transparent",
                border: `0.5px solid ${activeCategory === cat ? "rgba(127,119,221,0.5)" : "rgba(127,119,221,0.15)"}`,
                color: activeCategory === cat ? "#c0baf0" : "#4e4a6a",
              }}
              onMouseEnter={(e) => {
                if (activeCategory !== cat) {
                  e.currentTarget.style.borderColor =
                    "rgba(127,119,221,0.3)";
                  e.currentTarget.style.color = "#9994b8";
                }
              }}
              onMouseLeave={(e) => {
                if (activeCategory !== cat) {
                  e.currentTarget.style.borderColor =
                    "rgba(127,119,221,0.15)";
                  e.currentTarget.style.color = "#4e4a6a";
                }
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion */}
        {filtered.map((faq, i) => {
          const isOpen = openItem === i;
          return (
            <div
              key={i}
              style={{
                background: "#13121d",
                border: `0.5px solid ${isOpen ? "rgba(127,119,221,0.4)" : "rgba(127,119,221,0.15)"}`,
                borderRadius: 12,
                marginBottom: 8,
                overflow: "hidden",
                transition: "border-color 0.2s",
              }}
            >
              <div
                onClick={() => setOpenItem(isOpen ? null : i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "18px 22px",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    color: "#e8e6f0",
                    lineHeight: 1.4,
                    flex: 1,
                    paddingRight: 16,
                  }}
                >
                  {faq.question}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4e4a6a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{
                    flexShrink: 0,
                    transition: "transform 0.2s",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
              {isOpen && (
                <div
                  style={{
                    padding: "0 22px 20px",
                    fontSize: 14,
                    color: "#6b6690",
                    lineHeight: 1.8,
                    whiteSpace: "pre-line",
                  }}
                >
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}

        {/* Bottom CTA */}
        <div
          style={{
            marginTop: 64,
            background: "rgba(83,74,183,0.06)",
            border: "0.5px solid rgba(127,119,221,0.15)",
            borderRadius: 20,
            padding: 40,
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#f0eeff",
              marginBottom: 8,
              marginTop: 0,
            }}
          >
            Still have questions?
          </h2>
          <p style={{ fontSize: 15, color: "#4e4a6a", marginBottom: 24 }}>
            We&apos;re happy to help.
          </p>
          <div
            style={{ display: "flex", justifyContent: "center", gap: 12 }}
          >
            <button
              onClick={() => router.push("/v2/contact")}
              style={{
                background: "#534AB7",
                color: "#f0eeff",
                padding: "13px 32px",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 500,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#6258cc")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#534AB7")
              }
            >
              Contact us &rarr;
            </button>
            <button
              onClick={() => router.push("/v2")}
              style={{
                background: "transparent",
                border: "0.5px solid rgba(127,119,221,0.3)",
                color: "#9994b8",
                borderRadius: 10,
                padding: "13px 32px",
                fontSize: 15,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(127,119,221,0.5)";
                e.currentTarget.style.color = "#c0baf0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(127,119,221,0.3)";
                e.currentTarget.style.color = "#9994b8";
              }}
            >
              Try it free
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
