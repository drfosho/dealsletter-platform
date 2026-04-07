"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSignIn = async () => {
    if (!email || !password) {
      setAuthError("Please enter your email and password");
      return;
    }
    setIsLoading(true);
    setAuthError("");

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          setAuthError(
            "Please verify your email before signing in. Check your inbox for the verification link."
          );
        } else if (error.message.includes("Invalid login credentials")) {
          setAuthError(
            "Invalid email or password. Please check your credentials and try again."
          );
        } else {
          setAuthError(error.message);
        }
        return;
      }

      if (data.session) {
        const destination =
          searchParams?.get("redirect") ||
          localStorage.getItem("post_login_redirect") ||
          "/v2/dashboard";
        localStorage.removeItem("post_login_redirect");
        window.location.href = destination;
      } else {
        setAuthError("An unexpected error occurred. Please try again.");
      }
    } catch (err: any) {
      setAuthError(err.message || "Sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
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
            Welcome back
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#4e4a6a",
              marginBottom: 28,
              marginTop: 0,
            }}
          >
            Sign in to your Dealsletter account
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <label style={labelStyle}>Password</label>
            <span
              style={{
                fontSize: 12,
                color: "#534AB7",
                cursor: "pointer",
                marginBottom: 6,
              }}
              onClick={() => router.push("/v2/forgot-password")}
            >
              Forgot password?
            </span>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSignIn();
            }}
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

          {/* Submit */}
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            style={{
              width: "100%",
              marginTop: 4,
              background: "#534AB7",
              color: "#f0eeff",
              padding: 13,
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 500,
              border: "none",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.5 : 1,
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.background = "#6258cc";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#534AB7";
            }}
          >
            {isLoading ? "Signing in..." : "Sign in \u2192"}
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
            onClick={handleGoogleSignIn}
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
              e.currentTarget.style.borderColor = "rgba(127,119,221,0.4)";
              e.currentTarget.style.color = "#c0baf0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(127,119,221,0.2)";
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
            Continue with Google
          </button>
        </div>

        {/* Bottom link */}
        <p
          style={{
            marginTop: 20,
            textAlign: "center",
            fontSize: 13,
            color: "#4e4a6a",
          }}
        >
          Don&apos;t have an account?{" "}
          <span
            style={{
              color: "#534AB7",
              cursor: "pointer",
              fontWeight: 500,
            }}
            onClick={() => router.push("/v2/signup")}
          >
            Sign up free &rarr;
          </span>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
