"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const getStrength = (pwd: string): number => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const strength = getStrength(password);

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      setAuthError("Please fill in all fields");
      return;
    }
    if (!agreedToTerms) {
      setAuthError("Please agree to the terms");
      return;
    }
    setIsLoading(true);
    setAuthError("");

    try {
      const supabase = createClient();

      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/v2/auth/callback`,
          data: {
            full_name: name.trim(),
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) {
        // If user was created but confirmation email failed, treat as success
        if ((data as any)?.user?.id) {
          setIsSuccess(true);
          return;
        }
        const msg = error.message?.toLowerCase() || "";
        if (
          msg.includes("already registered") ||
          msg.includes("already been registered")
        ) {
          setAuthError(
            "An account with this email already exists. Please sign in instead."
          );
        } else {
          setAuthError(error.message);
        }
        return;
      }

      setIsSuccess(true);
    } catch (err: any) {
      setAuthError(err.message || "Sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/v2/auth/callback`,
      },
    });
    if (error) setAuthError(error.message);
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    color: "#3a3758",
    marginBottom: 6,
    display: "block",
  };

  const inputStyle: React.CSSProperties = {
    background: "#0d0d14",
    border: "0.5px solid rgba(127,119,221,0.2)",
    borderRadius: 8,
    padding: "12px 14px",
    color: "#e8e6f0",
    fontSize: 15,
    width: "100%",
    outline: "none",
    fontFamily: "inherit",
    marginBottom: 16,
  };

  const strengthColor =
    strength <= 1 ? "#f09595" : strength === 2 ? "#EF9F27" : "#1D9E75";
  const strengthLabel =
    strength <= 1
      ? "Weak"
      : strength === 2
        ? "Could be stronger"
        : strength === 3
          ? "Good password"
          : "Strong password";

  return (
    <div
      style={{
        background: "#0d0d14",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage:
          "radial-gradient(circle, rgba(127,119,221,0.1) 1px, transparent 1px)",
        backgroundSize: "30px 30px",
        position: "relative",
      }}
    >
      <style>{`
        @media (max-width: 480px) {
          .auth-card {
            padding: 28px 20px !important;
            border-radius: 16px !important;
          }
          .auth-wrapper {
            padding: 16px !important;
          }
        }
      `}</style>
      {/* Purple glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          height: 300,
          background:
            "radial-gradient(ellipse, rgba(83,74,183,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Content */}
      <div
        className="auth-wrapper"
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: 420,
          padding: 24,
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 28,
            cursor: "pointer",
          }}
          onClick={() => router.push("/v2")}
        >
          <div
            style={{
              width: 34,
              height: 34,
              background: "#3C3489",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="7" rx="1.5" fill="#c8c3f0" />
              <rect x="9" y="1" width="6" height="4" rx="1.5" fill="#c8c3f0" />
              <rect
                x="1"
                y="10"
                width="6"
                height="5"
                rx="1.5"
                fill="#9994b8"
              />
              <rect
                x="9"
                y="7"
                width="6"
                height="8"
                rx="1.5"
                fill="#9994b8"
              />
            </svg>
          </div>
          <span
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "#f0eeff",
              letterSpacing: "-0.4px",
            }}
          >
            Dealsletter
          </span>
        </div>

        {/* Auth Card */}
        <div
          className="auth-card"
          style={{
            background: "#13121d",
            border: "0.5px solid rgba(127,119,221,0.25)",
            borderRadius: 20,
            padding: "36px 40px",
            width: "100%",
          }}
        >
          {isSuccess ? (
            /* ---- Success State ---- */
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              {/* Email icon */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(83,74,183,0.12)",
                  border: "0.5px solid rgba(127,119,221,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7F77DD"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>

              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#f0eeff",
                  letterSpacing: "-0.4px",
                  marginBottom: 8,
                }}
              >
                Check your email
              </h2>

              <p
                style={{
                  fontSize: 14,
                  color: "#6b6690",
                  lineHeight: 1.7,
                  marginBottom: 24,
                }}
              >
                We sent a confirmation link to{" "}
                <span style={{ color: "#9994b8" }}>{email}</span>. Click the
                link to activate your account and get started.
              </p>

              <div
                style={{
                  background: "rgba(83,74,183,0.06)",
                  border: "0.5px solid rgba(127,119,221,0.15)",
                  borderRadius: 10,
                  padding: "14px 16px",
                  fontSize: 13,
                  color: "#4e4a6a",
                  lineHeight: 1.6,
                  marginBottom: 24,
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    fontWeight: 500,
                    color: "#6b6690",
                    marginBottom: 6,
                  }}
                >
                  Didn&apos;t get it?
                </div>
                Check your spam folder. The email comes from{" "}
                <span style={{ color: "#9994b8" }}>noreply@dealsletter.io</span>
              </div>

              <button
                onClick={() => router.push("/v2/login")}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "0.5px solid rgba(127,119,221,0.3)",
                  color: "#9994b8",
                  borderRadius: 10,
                  padding: "12px",
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Back to sign in
              </button>
            </div>
          ) : (
            /* ---- Form State ---- */
            <>
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#f0eeff",
                  letterSpacing: "-0.5px",
                  marginBottom: 6,
                  marginTop: 0,
                }}
              >
                Create your account
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: "#4e4a6a",
                  marginBottom: 28,
                  marginTop: 0,
                }}
              >
                Start analyzing real estate deals for free
              </p>

              {authError && (
                <div
                  style={{
                    margin: "0 0 16px",
                    background: "rgba(162,45,45,0.1)",
                    border: "0.5px solid rgba(162,45,45,0.3)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    color: "#f09595",
                    fontSize: 13,
                  }}
                >
                  {authError}
                </div>
              )}

              {/* Full Name */}
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor =
                    "rgba(127,119,221,0.5)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor =
                    "rgba(127,119,221,0.2)")
                }
              />

              {/* Email */}
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor =
                    "rgba(127,119,221,0.5)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor =
                    "rgba(127,119,221,0.2)")
                }
              />

              {/* Password */}
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSignUp();
                }}
                style={{ ...inputStyle, marginBottom: 0 }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor =
                    "rgba(127,119,221,0.5)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor =
                    "rgba(127,119,221,0.2)")
                }
              />

              {/* Password strength */}
              {password.length > 0 && (
                <>
                  <div
                    style={{
                      display: "flex",
                      gap: 4,
                      marginTop: 8,
                      marginBottom: 4,
                    }}
                  >
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: 3,
                          borderRadius: 2,
                          background:
                            i < strength
                              ? strengthColor
                              : "rgba(127,119,221,0.1)",
                        }}
                      />
                    ))}
                  </div>
                  <p
                    style={{
                      fontSize: 11,
                      marginTop: 2,
                      marginBottom: 0,
                      color: strengthColor,
                    }}
                  >
                    {strengthLabel}
                  </p>
                </>
              )}

              {/* Terms checkbox */}
              <div
                style={{
                  marginTop: 14,
                  marginBottom: 4,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                }}
              >
                <div
                  onClick={() => setAgreedToTerms(!agreedToTerms)}
                  style={{
                    width: 18,
                    height: 18,
                    flexShrink: 0,
                    marginTop: 1,
                    background: agreedToTerms ? "#534AB7" : "#0d0d14",
                    border: `0.5px solid ${agreedToTerms ? "#534AB7" : "rgba(127,119,221,0.3)"}`,
                    borderRadius: 4,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {agreedToTerms && (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                    >
                      <path
                        d="M1.5 5L4 7.5L8.5 2.5"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span
                  style={{ fontSize: 12, color: "#4e4a6a", lineHeight: 1.5 }}
                >
                  I agree to the{" "}
                  <span
                    style={{ color: "#534AB7", cursor: "pointer" }}
                    onClick={() => router.push("/terms")}
                  >
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span
                    style={{ color: "#534AB7", cursor: "pointer" }}
                    onClick={() => router.push("/privacy")}
                  >
                    Privacy Policy
                  </span>
                </span>
              </div>

              {/* Submit */}
              <button
                onClick={handleSignUp}
                disabled={!agreedToTerms || isLoading}
                style={{
                  width: "100%",
                  marginTop: 16,
                  background: "#534AB7",
                  color: "#f0eeff",
                  padding: 13,
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 500,
                  border: "none",
                  cursor:
                    !agreedToTerms || isLoading ? "not-allowed" : "pointer",
                  opacity: !agreedToTerms || isLoading ? 0.4 : 1,
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  if (agreedToTerms && !isLoading)
                    e.currentTarget.style.background = "#6258cc";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#534AB7";
                }}
              >
                {isLoading
                  ? "Creating account..."
                  : "Create free account \u2192"}
              </button>

              {/* Divider */}
              <div
                style={{
                  margin: "20px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: 0.5,
                    background: "rgba(127,119,221,0.1)",
                  }}
                />
                <span style={{ fontSize: 12, color: "#3a3758" }}>or</span>
                <div
                  style={{
                    flex: 1,
                    height: 0.5,
                    background: "rgba(127,119,221,0.1)",
                  }}
                />
              </div>

              {/* Google */}
              <button
                onClick={handleGoogleSignUp}
                style={{
                  width: "100%",
                  padding: 12,
                  background: "transparent",
                  border: "0.5px solid rgba(127,119,221,0.2)",
                  borderRadius: 10,
                  color: "#9994b8",
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(127,119,221,0.4)";
                  e.currentTarget.style.color = "#c0baf0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(127,119,221,0.2)";
                  e.currentTarget.style.color = "#9994b8";
                }}
              >
                <svg width="16" height="16" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                Sign up with Google
              </button>
            </>
          )}
        </div>

        {/* Bottom link */}
        {!isSuccess && (
          <p
            style={{
              marginTop: 20,
              textAlign: "center",
              fontSize: 13,
              color: "#4e4a6a",
            }}
          >
            Already have an account?{" "}
            <span
              style={{
                color: "#534AB7",
                cursor: "pointer",
                fontWeight: 500,
              }}
              onClick={() => router.push("/v2/login")}
            >
              Sign in &rarr;
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
