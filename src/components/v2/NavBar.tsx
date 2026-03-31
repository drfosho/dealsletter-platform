"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { label: "How it works", href: "/v2/how-it-works" },
  { label: "Strategies", href: "/v2/strategies" },
  { label: "Pricing", href: "/v2/pricing" },
  { label: "Blog", href: "/v2/blog" },
  { label: "Real Estate Deals", href: "https://newsletter.dealsletter.io", external: true },
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setIsLoadingUser(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setShowMenu(false);
    router.push("/v2");
  };

  const menuItemStyle: React.CSSProperties = {
    padding: "8px 12px",
    fontSize: 13,
    color: "#9994b8",
    cursor: "pointer",
    borderRadius: 6,
    border: "none",
    background: "transparent",
    width: "100%",
    textAlign: "left",
    fontFamily: "inherit",
  };

  return (
    <nav
      className="sticky top-0 z-50 flex w-full items-center justify-between transition-all duration-300"
      style={{
        padding: "22px 44px",
        borderBottom: "0.5px solid rgba(127,119,221,0.15)",
        background: scrolled ? "rgba(13,13,20,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
      }}
    >
      {/* Left — Logo */}
      <Link href="/v2" className="flex items-center gap-2.5 no-underline">
        <div
          className="flex items-center justify-center"
          style={{
            width: 34,
            height: 34,
            background: "#3C3489",
            borderRadius: 8,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="7" rx="1.5" fill="#c8c3f0" />
            <rect x="9" y="1" width="6" height="4" rx="1.5" fill="#c8c3f0" />
            <rect x="1" y="10" width="6" height="5" rx="1.5" fill="#9994b8" />
            <rect x="9" y="7" width="6" height="8" rx="1.5" fill="#9994b8" />
          </svg>
        </div>
        <span
          style={{
            fontSize: 19,
            fontWeight: 600,
            color: "#f0eeff",
            letterSpacing: "-0.4px",
          }}
        >
          Dealsletter
        </span>
      </Link>

      {/* Right — Nav links + auth */}
      <div className="flex items-center" style={{ gap: 20 }}>
        {/* Nav links — always visible */}
        <div className="flex items-center" style={{ gap: 34 }}>
          {navLinks.map((link) =>
            (link as any).external ? (
              <span
                key={link.label}
                className="no-underline transition-colors"
                style={{ fontSize: 14, color: "#6b6690", cursor: "pointer" }}
                onClick={() => window.open(link.href, "_blank", "noopener")}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#b0acd8")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6690")}
              >
                {link.label}
              </span>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="no-underline transition-colors"
                style={{ fontSize: 14, color: "#6b6690", cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#b0acd8")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6690")}
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        {!isLoadingUser && !user && (
          /* Logged out */
          <div className="flex items-center" style={{ gap: 20 }}>
            <Link
              href="/v2/login"
              className="no-underline transition-colors"
              style={{ fontSize: 14, color: "#6b6690", cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#b0acd8")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6690")}
            >
              Sign in
            </Link>

            <Link
              href="/v2/signup"
              className="inline-block no-underline transition-colors"
              style={{
                background: "#534AB7",
                color: "#f0eeff",
                padding: "9px 22px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                border: "none",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#6258cc")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#534AB7")
              }
            >
              Start free
            </Link>
          </div>
        )}

        {!isLoadingUser && user && (
          /* Logged in */
          <div className="flex items-center" style={{ gap: 20 }}>
            <button
              onClick={() => router.push("/v2")}
              style={{
                background: "transparent",
                border: "0.5px solid rgba(127,119,221,0.3)",
                borderRadius: 8,
                padding: "7px 16px",
                color: "#9994b8",
                fontSize: 13,
                cursor: "pointer",
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
              + New Analysis
            </button>

            {/* Avatar + dropdown */}
            <div ref={menuRef} style={{ position: "relative" }}>
              <div
                onClick={() => setShowMenu(!showMenu)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(83,74,183,0.3)",
                  border: "1px solid rgba(127,119,221,0.4)",
                  color: "#c0baf0",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {user.email?.[0]?.toUpperCase() || "U"}
              </div>

              {showMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: 40,
                    right: 0,
                    zIndex: 100,
                    background: "#13121d",
                    border: "0.5px solid rgba(127,119,221,0.25)",
                    borderRadius: 10,
                    padding: 6,
                    minWidth: 180,
                  }}
                >
                  {/* Email */}
                  <div
                    style={{
                      padding: "8px 12px",
                      fontSize: 12,
                      color: "#4e4a6a",
                      borderBottom: "0.5px solid rgba(127,119,221,0.1)",
                      marginBottom: 4,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user.email}
                  </div>

                  <button
                    style={menuItemStyle}
                    onClick={() => {
                      setShowMenu(false);
                      router.push("/v2/account");
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(127,119,221,0.1)";
                      e.currentTarget.style.color = "#c0baf0";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#9994b8";
                    }}
                  >
                    My Account
                  </button>

                  <button
                    style={menuItemStyle}
                    onClick={() => {
                      setShowMenu(false);
                      router.push("/v2/pricing");
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(127,119,221,0.1)";
                      e.currentTarget.style.color = "#c0baf0";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#9994b8";
                    }}
                  >
                    Pricing & Plans
                  </button>

                  <div
                    style={{
                      height: 0.5,
                      background: "rgba(127,119,221,0.1)",
                      margin: "4px 0",
                    }}
                  />

                  <button
                    style={{ ...menuItemStyle, color: "#f09595" }}
                    onClick={handleSignOut}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(162,45,45,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
