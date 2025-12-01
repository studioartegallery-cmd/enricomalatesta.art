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
  imageKey: string | null;
  createdAt: string;
  published: number;
};

function getImageUrl(imageKey: string | null) {
  if (!imageKey) return null;
  return `/api/artwork/image?key=${encodeURIComponent(imageKey)}`;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/blog", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Failed to load blog posts");
        }
        const data = (await res.json()) as BlogPost[];
        setPosts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="page">
    <header className="header">
    <h1 className="site-title">MalatestaArt</h1>
    </header>

    <nav className="top-links">
    <a href="/">Home</a>
    <a href="/about">About</a>
    </nav>

    <main className="main">
    <section className="text-section">
    <h2 className="section-title" style={{ textAlign: "center", marginBottom: "1rem" }}>Blog</h2>
    <p className="section-text" style={{ textAlign: "center" }}  >
    Short notes, stories and updates about new artworks and experiments.
    </p>
    </section>

    <section className="grid-wrapper">
    <article className="art-card">
    <div className="art-scroll">
    {isLoading ? (
      <div className="art-block">
      <div className="art-meta">
      <div className="art-title">Loading…</div>
      <div className="art-details">Please wait while the blog posts are loaded.</div>
      </div>
      </div>
    ) : posts.length === 0 ? (
      <div className="art-block">
      <div className="art-meta">
      <div className="art-title">No posts yet</div>
      <div className="art-details">
      When you create the first post in the Admin &rarr; Blog page, it will appear
      here.
      </div>
      </div>
      </div>
    ) : (
      posts.map((post) => {
        const imageUrl = getImageUrl(post.imageKey);
        const dateText = post.createdAt
        ? new Date(post.createdAt).toLocaleDateString()
        : "";
        return (
          <div key={post.id} className="art-block">
          <div className={`art-image ${imageUrl ? "" : "placeholder"}`}>
          {imageUrl && (
            <img
            src={imageUrl}
            alt={post.title}
            style={{
              width: "80%",        // half the card width
              height: "auto",
              display: "block",
              margin: "0 auto",    // center it
            }}
            />
          )}
          </div>

          <div className="art-meta">
          <div className="art-title">{post.title}</div>
          {dateText && <div className="art-details">Posted on {dateText}</div>}
          <div className="art-details">{post.excerpt}</div>
          <div className="art-footer">
          <Link href={`/blog/${post.slug}`} className="buy-button">
          Read
          </Link>
          </div>
          </div>
          </div>
        );
      })
    )}
    </div>
    </article>
    </section>
    </main>

    <footer className="footer">
    <div className="footer-copy">&copy; {new Date().getFullYear()} Enrico Malatesta</div>
    <nav className="footer-nav">
    <a href="/">Home</a>
    <a href="/about">About</a>
    <a href={TERMS_URL} target="_blank" rel="noopener noreferrer">Terms</a>
    <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer">Privacy</a>

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
