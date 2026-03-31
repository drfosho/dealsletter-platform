"use client";

import NavBar from "@/components/v2/NavBar";
import Footer from "@/components/v2/Footer";

const h2Style: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "#e8e6f0",
  margin: "32px 0 12px",
  paddingBottom: 8,
  borderBottom: "0.5px solid rgba(127,119,221,0.1)",
};

const pStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#6b6690",
  lineHeight: 1.8,
  marginBottom: 16,
};

const liStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#6b6690",
  lineHeight: 1.7,
  marginBottom: 8,
  paddingLeft: 4,
};

const linkStyle: React.CSSProperties = {
  color: "#7F77DD",
  textDecoration: "underline",
};

export default function V2TermsPage() {
  return (
    <div style={{ background: "#0d0d14", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <NavBar />

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "64px 24px 80px", flex: 1 }}>
        <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "1.5px", color: "#3C3489", marginBottom: 14 }}>Legal</p>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: "#f0eeff", letterSpacing: "-0.8px", marginBottom: 8, marginTop: 0 }}>Terms of Service</h1>
        <p style={{ fontSize: 13, color: "#3a3758", marginBottom: 32 }}>Last Updated: December 26, 2025</p>
        <div style={{ height: 0.5, background: "rgba(127,119,221,0.15)", marginBottom: 40 }} />

        <h2 style={h2Style}>1. Agreement to Terms</h2>
        <p style={pStyle}>By accessing or using Dealsletter (&ldquo;Service&rdquo;), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the Service.</p>

        <h2 style={h2Style}>2. Description of Service</h2>
        <p style={pStyle}>Dealsletter is an AI-powered property analysis tool that provides investment insights, financial projections, and recommendations for real estate properties. The Service includes:</p>
        <ul style={{ margin: "0 0 16px 20px", listStyle: "disc" }}>
          <li style={liStyle}>Property analysis and financial calculations</li>
          <li style={liStyle}>AI-generated investment recommendations</li>
          <li style={liStyle}>Market data and comparable sales information</li>
          <li style={liStyle}>Educational content and blog articles</li>
        </ul>

        <h2 style={h2Style}>3. User Accounts</h2>
        <p style={pStyle}>To access certain features, you must create an account. You agree to:</p>
        <ul style={{ margin: "0 0 16px 20px", listStyle: "disc" }}>
          <li style={liStyle}>Provide accurate, current, and complete information</li>
          <li style={liStyle}>Maintain the security of your account credentials</li>
          <li style={liStyle}>Accept responsibility for all activities under your account</li>
          <li style={liStyle}>Notify us immediately of any unauthorized access</li>
        </ul>

        <h2 style={h2Style}>4. Subscription Plans</h2>
        <p style={pStyle}><strong style={{ color: "#e8e6f0" }}>Free Plan:</strong> Unlimited analyses with Speed model (GPT-4o-mini)</p>
        <p style={pStyle}><strong style={{ color: "#e8e6f0" }}>Pro Plan:</strong> $29/month &mdash; Balanced model with auto-routing (Claude Sonnet / GPT-4.1)</p>
        <p style={pStyle}><strong style={{ color: "#e8e6f0" }}>Pro Max Plan:</strong> $79/month &mdash; Max IQ model with multi-model comparison (Claude Opus / GPT-4o / Grok 3)</p>
        <p style={pStyle}>Subscriptions automatically renew unless cancelled. You may cancel at any time from your account settings. Refunds are not provided for partial billing periods.</p>

        <h2 style={h2Style}>5. Acceptable Use</h2>
        <p style={pStyle}>You agree NOT to:</p>
        <ul style={{ margin: "0 0 16px 20px", listStyle: "disc" }}>
          <li style={{ ...liStyle, color: "#f09595" }}>Use the Service for any illegal purpose</li>
          <li style={{ ...liStyle, color: "#f09595" }}>Attempt to circumvent usage limits or access restrictions</li>
          <li style={{ ...liStyle, color: "#f09595" }}>Scrape, copy, or redistribute data without permission</li>
          <li style={{ ...liStyle, color: "#f09595" }}>Interfere with the Service&apos;s operation or security</li>
          <li style={{ ...liStyle, color: "#f09595" }}>Share your account credentials with others</li>
        </ul>

        <h2 style={h2Style}>6. Investment Disclaimer</h2>
        <div style={{ background: "rgba(240,149,149,0.08)", border: "0.5px solid rgba(240,149,149,0.25)", borderRadius: 10, padding: "16px 20px", marginBottom: 16 }}>
          <div style={{ background: "rgba(240,149,149,0.1)", borderLeft: "2px solid #f09595", padding: "12px 16px", borderRadius: "0 8px 8px 0", marginBottom: 12 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#f09595", margin: 0 }}>IMPORTANT: Dealsletter provides educational information and analysis tools only. This is NOT investment advice. All property analyses, projections, and recommendations are estimates based on available data and should not be relied upon as the sole basis for investment decisions.</p>
          </div>
          <p style={pStyle}>You acknowledge that:</p>
          <ul style={{ margin: "0 0 0 20px", listStyle: "disc" }}>
            <li style={liStyle}>Real estate investing involves substantial risk</li>
            <li style={liStyle}>Past performance does not guarantee future results</li>
            <li style={liStyle}>All financial projections are estimates and may be inaccurate</li>
            <li style={liStyle}>You should conduct your own due diligence and consult with qualified professionals</li>
            <li style={liStyle}>Dealsletter is not a licensed real estate broker or financial advisor</li>
          </ul>
        </div>

        <h2 style={h2Style}>7. Data Accuracy</h2>
        <p style={pStyle}>We obtain property data from third-party sources including RentCast API. While we strive for accuracy, we do not guarantee the completeness, accuracy, or timeliness of any data. You agree to verify all information independently before making investment decisions.</p>

        <h2 style={h2Style}>8. Intellectual Property</h2>
        <p style={pStyle}>The Service, including all content, features, and functionality, is owned by Dealsletter and protected by copyright, trademark, and other intellectual property laws. Your analyses and saved data remain your property.</p>

        <h2 style={h2Style}>9. Limitation of Liability</h2>
        <p style={{ ...pStyle, textTransform: "uppercase", fontSize: 12, letterSpacing: "0.3px" }}>TO THE MAXIMUM EXTENT PERMITTED BY LAW, DEALSLETTER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR INVESTMENT LOSSES, ARISING FROM YOUR USE OF THE SERVICE.</p>

        <h2 style={h2Style}>10. Termination</h2>
        <p style={pStyle}>We may terminate or suspend your account immediately, without prior notice, for any violation of these Terms. Upon termination, your right to use the Service will cease immediately.</p>

        <h2 style={h2Style}>11. Changes to Terms</h2>
        <p style={pStyle}>We reserve the right to modify these terms at any time. We will notify users of material changes via email or through the Service. Continued use after changes constitutes acceptance of new terms.</p>

        <h2 style={h2Style}>12. Contact</h2>
        <p style={pStyle}>For questions about these Terms, contact us at: <a href="mailto:support@dealsletter.io" style={linkStyle}>support@dealsletter.io</a></p>
      </main>

      <Footer />
    </div>
  );
}
