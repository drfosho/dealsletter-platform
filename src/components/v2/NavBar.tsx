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
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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
      className={`nav-outer ${scrolled ? 'scrolled' : ''}`}
    >
      <style>{`
        .nav-outer {
          padding: 22px 44px;
          background: transparent;
          border-bottom: 0.5px solid rgba(127,119,221,0.15);
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          position: sticky;
          top: 0;
          z-index: 50;
          transition: all 0.3s;
        }
        .nav-outer.scrolled {
          background: rgba(13,13,20,0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        @media (max-width: 768px) {
          .nav-outer {
            padding: 16px 20px;
          }
        }
        .nav-mobile-menu {
          display: none;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #0d0d14;
          z-index: 200;
          padding: 24px;
          overflow-y: auto;
        }
        .nav-mobile-menu.open {
          display: flex;
        }
        @media (max-width: 768px) {
          .nav-desktop-links-wrapper {
            display: none !important;
          }
        }
      `}</style>

      {/* Left — Logo */}
      <Link href="/v2" className="flex items-center gap-2.5 no-underline">
        <img
          src="/logos/logomark-34.png"
          alt="Dealsletter"
          style={{ width: 34, height: 34, objectFit: "contain" }}
        />
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

      {/* Right — Desktop nav links + auth */}
      <div className="nav-desktop-links-wrapper">
      {!isMobile && (
        <div className="flex items-center" style={{ gap: 20 }}>
          {/* Nav links */}
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
              <span
                onClick={() => router.push("/v2/dashboard")}
                style={{
                  fontSize: 14,
                  color: "#6b6690",
                  cursor: "pointer",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "#b0acd8")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "#6b6690")
                }
              >
                Dashboard
              </span>
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
      )}
      </div>

      {/* Hamburger button — mobile only */}
      {isMobile && (
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            zIndex: 300,
            WebkitTapHighlightColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            touchAction: 'manipulation',
          }}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f0eeff" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f0eeff" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </button>
      )}

      {/* Full-screen mobile menu */}
      <div className={`nav-mobile-menu ${menuOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logos/logomark-34.png" alt="Dealsletter" style={{ width: 28, height: 28, objectFit: 'contain' }} />
            <span style={{ fontSize: 18, fontWeight: 600, color: '#f0eeff' }}>Dealsletter</span>
          </div>
          <button onClick={() => setMenuOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f0eeff" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {navLinks.map((link) => (
          <div
            key={link.label}
            onClick={() => {
              setMenuOpen(false);
              if ((link as any).external) {
                window.open(link.href, '_blank', 'noopener');
              } else {
                router.push(link.href);
              }
            }}
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: '#e8e6f0',
              padding: '16px 0',
              borderBottom: '0.5px solid rgba(127,119,221,0.1)',
              cursor: 'pointer',
              letterSpacing: '-0.3px',
            }}
          >
            {link.label}
          </div>
        ))}

        <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
          {!isLoadingUser && user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div onClick={() => { setMenuOpen(false); router.push('/v2/dashboard'); }} style={{ fontSize: 16, color: '#9994b8', padding: '14px 20px', background: 'rgba(83,74,183,0.1)', borderRadius: 12, cursor: 'pointer' }}>Dashboard</div>
              <div onClick={() => { setMenuOpen(false); router.push('/v2'); }} style={{ fontSize: 16, color: '#9994b8', padding: '14px 20px', background: 'rgba(83,74,183,0.1)', borderRadius: 12, cursor: 'pointer' }}>+ New Analysis</div>
              <div onClick={() => { setMenuOpen(false); router.push('/v2/account'); }} style={{ fontSize: 16, color: '#9994b8', padding: '14px 20px', background: 'rgba(83,74,183,0.1)', borderRadius: 12, cursor: 'pointer' }}>My Account</div>
              <div onClick={() => { setMenuOpen(false); router.push('/v2/pricing'); }} style={{ fontSize: 16, color: '#9994b8', padding: '14px 20px', background: 'rgba(83,74,183,0.1)', borderRadius: 12, cursor: 'pointer' }}>Pricing &amp; Plans</div>
              <div onClick={() => { handleSignOut(); setMenuOpen(false); }} style={{ fontSize: 16, color: '#f09595', padding: '14px 20px', cursor: 'pointer' }}>Sign out</div>
            </div>
          ) : !isLoadingUser ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={() => { setMenuOpen(false); router.push('/v2/signup'); }} style={{ background: '#534AB7', color: '#f0eeff', border: 'none', borderRadius: 12, padding: 16, fontSize: 16, fontWeight: 600, cursor: 'pointer', width: '100%', fontFamily: 'inherit' }}>Start free &rarr;</button>
              <button onClick={() => { setMenuOpen(false); router.push('/v2/login'); }} style={{ background: 'transparent', color: '#9994b8', border: '0.5px solid rgba(127,119,221,0.3)', borderRadius: 12, padding: 16, fontSize: 16, cursor: 'pointer', width: '100%', fontFamily: 'inherit' }}>Sign in</button>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
