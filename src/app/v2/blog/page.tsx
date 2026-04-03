"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  blogPosts,
  getBlogCategories,
  getPostsByCategory,
} from "@/data/blog-posts";
import NavBar from "@/components/v2/NavBar";
import Footer from "@/components/v2/Footer";

export default function V2BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const router = useRouter();

  const categories = getBlogCategories();
  const filteredPosts = getPostsByCategory(activeCategory);
  const featured = filteredPosts[0];
  const rest = filteredPosts.slice(1);

  const hasRealImage = (url: string) =>
    url && !url.includes("/api/placeholder");

  return (
    <div style={{ background: "#0d0d14", minHeight: "100vh" }}>
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
        className="blog-main page-main"
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 960,
          margin: "0 auto",
          padding: "72px 24px 80px",
        }}
      >
        <style>{`
          @media (max-width: 768px) {
            .featured-post-card {
              flex-direction: column !important;
            }
            .featured-post-image {
              width: 100% !important;
              height: 200px !important;
            }
            .blog-grid {
              grid-template-columns: 1fr !important;
            }
            .blog-main {
              padding: 48px 16px 64px !important;
            }
            .page-headline {
              font-size: 28px !important;
              letter-spacing: -0.5px !important;
            }
          }
        `}</style>
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
          Blog
        </p>
        <h1
          className="page-headline"
          style={{
            fontSize: 42,
            fontWeight: 700,
            color: "#f0eeff",
            letterSpacing: "-1.2px",
            marginBottom: 12,
            marginTop: 0,
          }}
        >
          Real estate insights.
        </h1>
        <p
          style={{
            fontSize: 16,
            color: "#4e4a6a",
            maxWidth: 480,
            marginBottom: 48,
            lineHeight: 1.6,
          }}
        >
          Market analysis, deal breakdowns, tax strategy, and investment intel
          &mdash; written for investors who do the math.
        </p>

        {/* Category filter */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 40,
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
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

        {/* Featured post */}
        {featured && (
          <div
            className="featured-post-card"
            onClick={() => router.push(`/v2/blog/${featured.slug}`)}
            style={{
              background: "#13121d",
              border: "0.5px solid rgba(127,119,221,0.2)",
              borderRadius: 16,
              overflow: "hidden",
              marginBottom: 32,
              cursor: "pointer",
              transition: "border-color 0.2s",
              display: "flex",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "rgba(127,119,221,0.4)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "rgba(127,119,221,0.2)")
            }
          >
            {hasRealImage(featured.imageUrl) && (
              <div
                className="featured-post-image"
                style={{
                  width: "40%",
                  minHeight: 220,
                  background: "rgba(127,119,221,0.05)",
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                <Image
                  src={featured.imageUrl}
                  alt={featured.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
            )}
            <div style={{ padding: 32, flex: 1 }}>
              <span
                style={{
                  display: "inline-block",
                  background: "rgba(83,74,183,0.2)",
                  border: "0.5px solid rgba(127,119,221,0.3)",
                  borderRadius: 5,
                  padding: "3px 10px",
                  fontSize: 11,
                  color: "#9994b8",
                  marginBottom: 12,
                }}
              >
                {featured.category}
              </span>
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#f0eeff",
                  letterSpacing: "-0.5px",
                  marginBottom: 10,
                  lineHeight: 1.3,
                  marginTop: 0,
                }}
              >
                {featured.title}
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: "#6b6690",
                  lineHeight: 1.7,
                  marginBottom: 16,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical" as any,
                  overflow: "hidden",
                }}
              >
                {featured.excerpt}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  fontSize: 12,
                  color: "#3a3758",
                  alignItems: "center",
                }}
              >
                <span>{featured.date}</span>
                <span>{featured.readTime}</span>
                <span
                  style={{ marginLeft: "auto", color: "#534AB7" }}
                >
                  Read article &rarr;
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Post grid */}
        {rest.length > 0 && (
          <div
            className="blog-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {rest.map((post) => (
              <div
                key={post.slug}
                onClick={() => router.push(`/v2/blog/${post.slug}`)}
                style={{
                  background: "#13121d",
                  border: "0.5px solid rgba(127,119,221,0.15)",
                  borderRadius: 14,
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor =
                    "rgba(127,119,221,0.35)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor =
                    "rgba(127,119,221,0.15)")
                }
              >
                {hasRealImage(post.imageUrl) ? (
                  <div
                    style={{
                      width: "100%",
                      height: 160,
                      position: "relative",
                      background: "rgba(127,119,221,0.05)",
                    }}
                  >
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: 100,
                      background: "rgba(83,74,183,0.06)",
                      borderBottom:
                        "0.5px solid rgba(127,119,221,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 32,
                        color: "rgba(127,119,221,0.2)",
                        fontWeight: 700,
                      }}
                    >
                      {post.category[0]}
                    </span>
                  </div>
                )}
                <div style={{ padding: "18px 20px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      background: "rgba(83,74,183,0.2)",
                      border:
                        "0.5px solid rgba(127,119,221,0.3)",
                      borderRadius: 5,
                      padding: "2px 8px",
                      fontSize: 10,
                      color: "#9994b8",
                      marginBottom: 10,
                    }}
                  >
                    {post.category}
                  </span>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#e8e6f0",
                      letterSpacing: "-0.2px",
                      lineHeight: 1.4,
                      marginBottom: 8,
                      marginTop: 0,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical" as any,
                      overflow: "hidden",
                    }}
                  >
                    {post.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#4e4a6a",
                      lineHeight: 1.6,
                      marginBottom: 14,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical" as any,
                      overflow: "hidden",
                    }}
                  >
                    {post.excerpt}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      fontSize: 11,
                      color: "#3a3758",
                    }}
                  >
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {filteredPosts.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: 48,
            }}
          >
            <div
              style={{
                fontSize: 16,
                color: "#4e4a6a",
                marginTop: 16,
              }}
            >
              No posts in this category yet.
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
