"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Strategies", href: "#strategies" },
  { label: "Pricing", href: "#pricing" },
  { label: "Blog", href: "/blog" },
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      <Link href="/" className="flex items-center gap-2.5 no-underline">
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

      {/* Right — Nav links + CTA */}
      <div className="flex items-center" style={{ gap: 34 }}>
        {navLinks.map((link) => (
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
        ))}

        <Link
          href="/login"
          className="no-underline transition-colors"
          style={{ fontSize: 14, color: "#6b6690", cursor: "pointer" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#b0acd8")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6690")}
        >
          Sign in
        </Link>

        <Link
          href="/signup"
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
          onMouseEnter={(e) => (e.currentTarget.style.background = "#6258cc")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#534AB7")}
        >
          Start free
        </Link>
      </div>
    </nav>
  );
}
