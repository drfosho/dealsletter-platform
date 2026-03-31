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

const h3Style: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: "#d8d4f4",
  margin: "20px 0 8px",
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

export default function V2PrivacyPage() {
  return (
    <div style={{ background: "#0d0d14", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <NavBar />

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "64px 24px 80px", flex: 1 }}>
        <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "1.5px", color: "#3C3489", marginBottom: 14 }}>Legal</p>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: "#f0eeff", letterSpacing: "-0.8px", marginBottom: 8, marginTop: 0 }}>Privacy Policy</h1>
        <p style={{ fontSize: 13, color: "#3a3758", marginBottom: 32 }}>Last Updated: December 26, 2025</p>
        <div style={{ height: 0.5, background: "rgba(127,119,221,0.15)", marginBottom: 40 }} />

        <h2 style={h2Style}>1. Information We Collect</h2>
        <h3 style={h3Style}>Information You Provide:</h3>
        <ul style={{ margin: "0 0 16px 20px", listStyle: "disc" }}>
          <li style={liStyle}>Account information (name, email address)</li>
          <li style={liStyle}>Investment preferences and location</li>
          <li style={liStyle}>Property addresses you analyze</li>
          <li style={liStyle}>Payment information (processed securely by Stripe)</li>
        </ul>
        <h3 style={h3Style}>Automatically Collected Information:</h3>
        <ul style={{ margin: "0 0 16px 20px", listStyle: "disc" }}>
          <li style={liStyle}>Usage data (analyses performed, features used)</li>
          <li style={liStyle}>Device information (browser type, IP address)</li>
          <li style={liStyle}>Cookies and similar tracking technologies</li>
        </ul>

        <h2 style={h2Style}>2. How We Use Your Information</h2>
        <p style={pStyle}>We use your information to:</p>
        <ul style={{ margin: "0 0 16px 20px", listStyle: "disc" }}>
          <li style={liStyle}>Provide and improve the Service</li>
          <li style={liStyle}>Process your property analyses</li>
          <li style={liStyle}>Manage your account and subscription</li>
          <li style={liStyle}>Send important updates about the Service</li>
          <li style={liStyle}>Provide customer support</li>
          <li style={liStyle}>Analyze usage patterns to improve features</li>
          <li style={liStyle}>Send marketing communications (with your consent)</li>
        </ul>

        <h2 style={h2Style}>3. Information Sharing</h2>
        <p style={pStyle}>We share your information with:</p>
        <h3 style={h3Style}>Service Providers:</h3>
        <ul style={{ margin: "0 0 16px 20px", listStyle: "disc" }}>
          <li style={liStyle}><strong style={{ color: "#e8e6f0" }}>Supabase:</strong> Database and authentication</li>
          <li style={liStyle}><strong style={{ color: "#e8e6f0" }}>Stripe:</strong> Payment processing</li>
          <li style={liStyle}><strong style={{ color: "#e8e6f0" }}>RentCast:</strong> Property data (addresses only)</li>
          <li style={liStyle}><strong style={{ color: "#e8e6f0" }}>Anthropic / OpenAI / xAI:</strong> AI analysis generation</li>
          <li style={liStyle}><strong style={{ color: "#e8e6f0" }}>Vercel:</strong> Hosting and deployment</li>
        </ul>
        <div style={{ background: "rgba(29,158,117,0.08)", borderLeft: "2px solid #1D9E75", padding: "12px 16px", borderRadius: "0 8px 8px 0", marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#1D9E75", margin: 0 }}>We do NOT sell your personal information to third parties.</p>
        </div>

        <h2 style={h2Style}>4. Data Security</h2>
        <p style={pStyle}>We implement industry-standard security measures including encryption, secure authentication, and regular security audits. However, no method of transmission over the Internet is 100% secure.</p>

        <h2 style={h2Style}>5. Your Rights</h2>
        <p style={pStyle}>You have the right to:</p>
        <ul style={{ margin: "0 0 16px 20px", listStyle: "disc" }}>
          <li style={liStyle}>Access your personal data</li>
          <li style={liStyle}>Correct inaccurate data</li>
          <li style={liStyle}>Request deletion of your data</li>
          <li style={liStyle}>Export your analysis history</li>
          <li style={liStyle}>Opt out of marketing communications</li>
          <li style={liStyle}>Withdraw consent at any time</li>
        </ul>
        <p style={pStyle}>To exercise these rights, contact us at <a href="mailto:privacy@dealsletter.io" style={linkStyle}>privacy@dealsletter.io</a></p>

        <h2 style={h2Style}>6. Data Retention</h2>
        <p style={pStyle}>We retain your data for as long as your account is active or as needed to provide services. After account deletion, we may retain certain information for legal compliance, dispute resolution, and fraud prevention.</p>

        <h2 style={h2Style}>7. Cookies</h2>
        <p style={pStyle}>We use cookies and similar technologies for authentication, preferences, and analytics. You can control cookies through your browser settings, but some features may not function properly without them.</p>

        <h2 style={h2Style}>8. Children&apos;s Privacy</h2>
        <p style={pStyle}>The Service is not intended for users under 18. We do not knowingly collect information from children. If you believe a child has provided us with personal information, please contact us.</p>

        <h2 style={h2Style}>9. California Privacy Rights</h2>
        <p style={pStyle}>California residents have additional rights under CCPA, including the right to know what personal information is collected and the right to opt-out of sale (we do not sell personal information).</p>

        <h2 style={h2Style}>10. International Users</h2>
        <p style={pStyle}>Your information may be transferred to and processed in the United States. By using the Service, you consent to this transfer.</p>

        <h2 style={h2Style}>11. Changes to Privacy Policy</h2>
        <p style={pStyle}>We may update this Privacy Policy from time to time. We will notify you of material changes via email or through the Service.</p>

        <h2 style={h2Style}>12. Contact Us</h2>
        <p style={pStyle}>For privacy questions or concerns, contact us at: <a href="mailto:privacy@dealsletter.io" style={linkStyle}>privacy@dealsletter.io</a></p>
      </main>

      <Footer />
    </div>
  );
}
