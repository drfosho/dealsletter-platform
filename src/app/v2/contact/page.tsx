"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/v2/NavBar";
import Footer from "@/components/v2/Footer";

const inputStyle: React.CSSProperties = {
  background: "#0d0d14",
  border: "0.5px solid rgba(127,119,221,0.2)",
  borderRadius: 8,
  padding: "11px 14px",
  color: "#e8e6f0",
  fontSize: 14,
  width: "100%",
  fontFamily: "inherit",
  outline: "none",
  marginBottom: 16,
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.6px",
  color: "#3a3758",
  display: "block",
  marginBottom: 6,
};

export default function V2ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitError("Please fill in your name, email, and message.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    const subject = encodeURIComponent(
      `[Dealsletter] ${formData.subject || "Contact Form"}`
    );
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nSubject: ${formData.subject}\n\nMessage:\n${formData.message}`
    );

    window.location.href = `mailto:main@dealsletter.io?subject=${subject}&body=${body}`;

    setTimeout(() => {
      setSubmitted(true);
      setIsSubmitting(false);
    }, 500);
  };

  const cardStyle: React.CSSProperties = {
    background: "#13121d",
    border: "0.5px solid rgba(127,119,221,0.15)",
    borderRadius: 14,
    padding: "22px 24px",
    marginBottom: 12,
    cursor: "pointer",
    transition: "border-color 0.2s",
  };

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
          maxWidth: 860,
          margin: "0 auto",
          padding: "72px 24px 80px",
          flex: 1,
        }}
      >
        {/* Header */}
        <p
          style={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            color: "#3C3489",
            marginBottom: 14,
          }}
        >
          Contact
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
          Get in touch.
        </h1>
        <p
          style={{
            fontSize: 16,
            color: "#4e4a6a",
            marginBottom: 56,
            maxWidth: 440,
            lineHeight: 1.6,
          }}
        >
          We&apos;re a small team and we read every message. Expect a reply
          within 1-2 business days.
        </p>

        {/* Two column layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
            alignItems: "start",
            marginBottom: 64,
          }}
        >
          {/* LEFT — Contact cards */}
          <div>
            {/* General */}
            <div
              style={cardStyle}
              onClick={() =>
                (window.location.href = "mailto:main@dealsletter.io")
              }
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "rgba(127,119,221,0.4)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "rgba(127,119,221,0.15)")
              }
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#7F77DD"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginBottom: 10 }}
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#e8e6f0",
                  marginBottom: 4,
                }}
              >
                General inquiries
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#4e4a6a",
                  lineHeight: 1.6,
                  marginBottom: 10,
                }}
              >
                Questions about the product, partnerships, press, or anything
                else.
              </div>
              <span style={{ fontSize: 13, color: "#534AB7", fontWeight: 500 }}>
                main@dealsletter.io
              </span>
            </div>

            {/* Support */}
            <div
              style={cardStyle}
              onClick={() =>
                (window.location.href = "mailto:support@dealsletter.io")
              }
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "rgba(127,119,221,0.4)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "rgba(127,119,221,0.15)")
              }
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#7F77DD"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginBottom: 10 }}
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
                <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
                <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
                <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
                <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
              </svg>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#e8e6f0",
                  marginBottom: 4,
                }}
              >
                Product support
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#4e4a6a",
                  lineHeight: 1.6,
                  marginBottom: 10,
                }}
              >
                Having trouble with your account, analysis, or billing?
                We&apos;ll get it sorted.
              </div>
              <span style={{ fontSize: 13, color: "#534AB7", fontWeight: 500 }}>
                support@dealsletter.io
              </span>
            </div>

            {/* Privacy */}
            <div
              style={cardStyle}
              onClick={() =>
                (window.location.href = "mailto:privacy@dealsletter.io")
              }
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "rgba(127,119,221,0.4)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "rgba(127,119,221,0.15)")
              }
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#7F77DD"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginBottom: 10 }}
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#e8e6f0",
                  marginBottom: 4,
                }}
              >
                Privacy &amp; data
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#4e4a6a",
                  lineHeight: 1.6,
                  marginBottom: 10,
                }}
              >
                Data deletion requests, privacy questions, or GDPR inquiries.
              </div>
              <span style={{ fontSize: 13, color: "#534AB7", fontWeight: 500 }}>
                privacy@dealsletter.io
              </span>
            </div>

            {/* Founder note */}
            <div
              style={{
                padding: "16px 20px",
                background: "rgba(83,74,183,0.06)",
                border: "0.5px solid rgba(127,119,221,0.12)",
                borderRadius: 10,
              }}
            >
              <p
                style={{ fontSize: 13, color: "#4e4a6a", lineHeight: 1.6, margin: 0 }}
              >
                Built and maintained by a solo founder. Every email goes directly
                to Kevin.
              </p>
              <p style={{ fontSize: 12, color: "#3a3758", marginTop: 6, marginBottom: 0 }}>
                &mdash; Kevin Godbey, Founder
              </p>
            </div>
          </div>

          {/* RIGHT — Contact form */}
          <div
            style={{
              background: "#13121d",
              border: "0.5px solid rgba(127,119,221,0.2)",
              borderRadius: 16,
              padding: "28px 28px",
            }}
          >
            {submitted ? (
              /* Success state */
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "rgba(29,158,117,0.12)",
                    border: "1.5px solid rgba(29,158,117,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1D9E75"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#f0eeff",
                    marginBottom: 8,
                  }}
                >
                  Message sent!
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: "#4e4a6a",
                    lineHeight: 1.6,
                    marginBottom: 20,
                  }}
                >
                  Thanks for reaching out. We&apos;ll get back to you within 1-2
                  business days.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", subject: "", message: "" });
                  }}
                  style={{
                    background: "transparent",
                    border: "0.5px solid rgba(127,119,221,0.3)",
                    color: "#9994b8",
                    borderRadius: 8,
                    padding: "8px 18px",
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              /* Form */
              <>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 600,
                    color: "#e8e6f0",
                    marginBottom: 22,
                  }}
                >
                  Send a message
                </div>

                {submitError && (
                  <div
                    style={{
                      marginBottom: 12,
                      background: "rgba(162,45,45,0.1)",
                      border: "0.5px solid rgba(162,45,45,0.3)",
                      borderRadius: 8,
                      padding: "10px 14px",
                      color: "#f09595",
                      fontSize: 13,
                    }}
                  >
                    {submitError}
                  </div>
                )}

                <label style={labelStyle}>Your Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  style={inputStyle}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(127,119,221,0.5)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(127,119,221,0.2)")
                  }
                />

                <label style={labelStyle}>Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  style={inputStyle}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(127,119,221,0.5)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(127,119,221,0.2)")
                  }
                />

                <label style={labelStyle}>What&apos;s this about?</label>
                <select
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  style={{
                    ...inputStyle,
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234e4a6a' stroke-width='2' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 14px center",
                    paddingRight: 36,
                  }}
                >
                  <option value="" disabled>
                    Select a topic...
                  </option>
                  <option value="General question">General question</option>
                  <option value="Product support">Product support</option>
                  <option value="Billing issue">Billing issue</option>
                  <option value="Bug report">Bug report</option>
                  <option value="Partnership or press">
                    Partnership or press
                  </option>
                  <option value="Privacy or data request">
                    Privacy or data request
                  </option>
                  <option value="Other">Other</option>
                </select>

                <label style={labelStyle}>Message</label>
                <textarea
                  placeholder="Tell us what's on your mind..."
                  rows={5}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    minHeight: 120,
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(127,119,221,0.5)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(127,119,221,0.2)")
                  }
                />

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  style={{
                    width: "100%",
                    marginTop: 4,
                    background: "#534AB7",
                    color: "#f0eeff",
                    padding: 13,
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 500,
                    border: "none",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.5 : 1,
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting)
                      e.currentTarget.style.background = "#6258cc";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#534AB7";
                  }}
                >
                  {isSubmitting ? "Sending..." : "Send message \u2192"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* FAQ callout */}
        <div
          style={{
            padding: "28px 32px",
            background: "rgba(83,74,183,0.06)",
            border: "0.5px solid rgba(127,119,221,0.12)",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#e8e6f0",
                marginBottom: 4,
              }}
            >
              Looking for quick answers?
            </div>
            <div style={{ fontSize: 13, color: "#4e4a6a" }}>
              Check our FAQ &mdash; most common questions are answered there.
            </div>
          </div>
          <button
            onClick={() => router.push("/v2/faq")}
            style={{
              background: "transparent",
              border: "0.5px solid rgba(127,119,221,0.3)",
              color: "#9994b8",
              borderRadius: 8,
              padding: "9px 20px",
              fontSize: 13,
              cursor: "pointer",
              flexShrink: 0,
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#c0baf0";
              e.currentTarget.style.borderColor = "rgba(127,119,221,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#9994b8";
              e.currentTarget.style.borderColor = "rgba(127,119,221,0.3)";
            }}
          >
            Browse FAQ &rarr;
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
