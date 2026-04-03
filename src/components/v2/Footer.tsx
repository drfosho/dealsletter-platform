"use client";

import { useRouter } from "next/navigation";

const columns = [
  {
    label: "Product",
    links: [
      { text: "Analyze Property", href: "/v2" },
      { text: "How It Works", href: "/v2/how-it-works" },
      { text: "Strategies", href: "/v2/strategies" },
      { text: "Pricing", href: "/v2/pricing" },
    ],
  },
  {
    label: "Resources",
    links: [
      { text: "Blog", href: "/v2/blog" },
      { text: "Real Estate Deals", href: "https://newsletter.dealsletter.io", external: true },
      { text: "FAQ", href: "/v2/faq" },
    ],
  },
  {
    label: "Company",
    links: [
      { text: "Contact", href: "/v2/contact" },
      { text: "Newsletter", href: "https://newsletter.dealsletter.io", external: true },
    ],
  },
  {
    label: "Legal",
    links: [
      { text: "Privacy Policy", href: "/v2/privacy" },
      { text: "Terms of Service", href: "/v2/terms" },
    ],
  },
];

export default function Footer() {
  const router = useRouter();

  const handleClick = (href: string, external?: boolean) => {
    if (external) {
      window.open(href, "_blank", "noopener");
    } else {
      router.push(href);
    }
  };

  return (
    <footer
      className="footer-outer"
      style={{
        borderTop: "0.5px solid rgba(127,119,221,0.1)",
        background: "#0d0d14",
        padding: "40px 44px 32px",
        marginTop: "auto",
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .footer-columns {
            display: none !important;
          }
          .footer-top-row {
            flex-direction: column !important;
            gap: 20px !important;
          }
          .footer-bottom-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
          }
          .footer-outer {
            padding: 32px 20px 24px !important;
          }
        }
      `}</style>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Row 1 */}
        <div
          className="footer-top-row"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 32,
            flexWrap: "wrap",
            gap: 32,
          }}
        >
          {/* Logo + description */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  background: "#3C3489",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="1" width="6" height="7" rx="1.5" fill="#c8c3f0" />
                  <rect x="9" y="1" width="6" height="4" rx="1.5" fill="#c8c3f0" />
                  <rect x="1" y="10" width="6" height="5" rx="1.5" fill="#9994b8" />
                  <rect x="9" y="7" width="6" height="8" rx="1.5" fill="#9994b8" />
                </svg>
              </div>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#f0eeff",
                  letterSpacing: "-0.4px",
                }}
              >
                Dealsletter
              </span>
            </div>
            <p
              style={{
                fontSize: 13,
                color: "#3a3758",
                maxWidth: 220,
                lineHeight: 1.6,
              }}
            >
              AI-powered real estate investment analysis for serious investors.
            </p>
          </div>

          {/* Link columns */}
          <div className="footer-columns" style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
            {columns.map((col) => (
              <div key={col.label}>
                <div
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: "#3a3758",
                    marginBottom: 12,
                  }}
                >
                  {col.label}
                </div>
                {col.links.map((link) => (
                  <div
                    key={link.text}
                    onClick={() => handleClick(link.href, (link as any).external)}
                    style={{
                      fontSize: 13,
                      color: "#4e4a6a",
                      cursor: "pointer",
                      display: "block",
                      marginBottom: 8,
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#9994b8")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#4e4a6a")}
                  >
                    {link.text}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 */}
        <div
          className="footer-bottom-row"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "0.5px solid rgba(127,119,221,0.08)",
            paddingTop: 20,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 12, color: "#2e2c48" }}>
            &copy; 2026 Dealsletter &middot; dealsletter.io
          </span>
          <div style={{ display: "flex", gap: 16 }}>
            {[
              { text: "Privacy Policy", href: "/v2/privacy" },
              { text: "Terms of Service", href: "/v2/terms" },
            ].map((link) => (
              <span
                key={link.text}
                onClick={() => router.push(link.href)}
                style={{
                  fontSize: 12,
                  color: "#2e2c48",
                  cursor: "pointer",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#4e4a6a")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#2e2c48")}
              >
                {link.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
