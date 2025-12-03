"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const R2_BASE = process.env.NEXT_PUBLIC_R2_BASE || "";
const TERMS_URL = R2_BASE ? `${R2_BASE}/admin/terms.pdf` : "#";
const PRIVACY_URL = R2_BASE ? `${R2_BASE}/admin/privacy.pdf` : "#";

type BlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string | null;
  imageKey: string | null;
  createdAt: string;
  published: number;
};

function getImageUrl(imageKey: string | null) {
  if (!imageKey) return null;
  return `/api/artwork/image?key=${encodeURIComponent(imageKey)}`;
}

type BlogDetailClientProps = {
  slug: string;
};

export default function BlogDetailClient({ slug }: BlogDetailClientProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    async function load() {
      try {
        const res = await fetch(`/api/blog?slug=${encodeURIComponent(slug)}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          if (res.status === 404) {
            setNotFound(true);
            return;
          }
          throw new Error("Failed to load blog post");
        }

        const data = (await res.json()) as BlogPost;
        setPost(data);
      } catch (err) {
        console.error(err);
        setNotFound(true);
      }
    }

    load();
  }, [slug]);

  const imageUrl = getImageUrl(post?.imageKey ?? null);
  const dateText = post?.createdAt
    ? new Date(post.createdAt).toLocaleDateString()
    : "";

    const startYear = 2025;
    const currentYear = new Date().getFullYear();
    const yearText =
    currentYear > startYear ? `${startYear}–${currentYear}` : `${startYear}`;

  return (
    <div className="page">
      <header className="header">
        <h1 className="site-title">MalatestaArt</h1>
      </header>

      <main className="main">
        {notFound ? (
          <section className="text-section">
            <h2 className="section-title">Post not found</h2>
            <p className="section-text">
              This blog post does not exist or is not published anymore.
            </p>
            <div className="admin-back-row">
              <Link href="/blog" className="buy-button">
                ← Back to Blog
              </Link>
              <Link href="/" className="buy-button">
                ← Back to Home
              </Link>
            </div>
          </section>
        ) : !post ? (
          <section className="text-section">
            <h2 className="section-title">Loading...</h2>
            <p className="section-text">Please wait while we load the post.</p>
          </section>
        ) : (
          <section className="text-section">
            <div
              className="blog-post-card"
              style={{
                width: "100%",
                maxWidth: "800px",
                margin: "0 auto",
                padding: "24px 22px 28px",
                borderRadius: "18px",
                background:
                  "radial-gradient(circle at top left, rgba(31,41,55,0.96), rgba(15,23,42,0.94))",
                boxShadow: "0 18px 40px rgba(0,0,0,0.85)",
                border: "1px solid rgba(148,163,184,0.25)",
              }}
            >
              <h2 className="section-title">{post.title}</h2>
              <p className="section-text meta-text">
                {dateText && <span className="meta-item">{dateText}</span>}
              </p>

              {/* Image floated left with text wrapping */}
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={post.title}
                  loading="lazy"
                  style={{
                    width: "45%",
                    height: "auto",
                    borderRadius: "14px",
                    display: "block",
                    float: "left",
                    marginTop: "18px",
                    marginRight: "20px",
                    marginBottom: "18px",
                  }}
                />
              )}

              <p className="section-text excerpt-text">{post.excerpt}</p>

              {post.body && (
                <div className="section-text blog-body">
                  {post.body.split("\n").map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              )}

              {/* Clear float so nothing below gets pulled up */}
              <div style={{ clear: "both" }} />
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
      <div className="footer-copy">
      &copy; {yearText} Enrico Malatesta
      </div>
      <nav className="footer-nav">
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href={TERMS_URL} target="_blank">
      Terms
      </a>
      <a href={PRIVACY_URL} target="_blank">
      Privacy
      </a>
      <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        document.cookie =
        "emart_cookie_consent=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      window.location.reload();
      }}
      >
      Cookies
      </a>
      <a href="/blog">Blog</a>
      </nav>
      </footer>

    </div>
  );
}
