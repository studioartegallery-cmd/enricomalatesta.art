"use client";

import { useState } from "react";
import Link from "next/link";

const R2_BASE = process.env.NEXT_PUBLIC_R2_BASE || "";
const TERMS_URL = R2_BASE ? `${R2_BASE}/admin/terms.pdf` : "#";
const PRIVACY_URL = R2_BASE ? `${R2_BASE}/admin/privacy.pdf` : "#";

// About image is always stored at this fixed key in the R2 bucket.
const ABOUT_IMAGE_URL = "/api/artwork/image?key=admin/about-bio.webp";

export default function AboutPage() {
  const [showFallback, setShowFallback] = useState(false);

  // Cache-busting param so we always see the latest image version.
  const [imageSrc] = useState(() => `${ABOUT_IMAGE_URL}&t=${Date.now()}`);

  return (
    <div className="page">
    <header className="header">
    <h1 className="site-title">MalatestaArt</h1>
    </header>

    <nav className="top-links">
    <a href="/">Home</a>
    <a href="/blog">Blog</a>
    </nav>

    <main className="main">
    <section className="text-section about-section">
    {!showFallback ? (
      <div className="admin-preview">
      <div className="admin-preview-inner">
      <img
      src={imageSrc}
      alt="About Enrico Malatesta"
      className="about-bio-image"
      onError={() => setShowFallback(true)}
      />
      {/* Instagram link under the bio image */}
      <p className="instagram-line">
      Instagram:{" "}
      <a
      href="https://www.instagram.com/enricomalatesta7"
      target="_blank"
      rel="noopener noreferrer"
      >
      @enricomalatesta7
      </a>
      </p>
      </div>
      </div>
    ) : (
      <>
      <p className="section-text">
      Enrico Malatesta is a visual and digital artist working between
      acrylic painting and contemporary mixed media. His practice
      moves freely between precise geometric structures and more
      intuitive, gestural compositions, often combining traditional
      techniques with digital experimentation.
      </p>
      <p className="section-text">
      This page will later be replaced by a designed bio image managed
      from the admin area. Until then, this text acts as a permanent
      fallback so the About section always stays readable, even if no
      image has been uploaded yet.
      </p>
      {/* Instagram link also shown in fallback mode */}
      <p className="instagram-line">
      Instagram:{" "}
      <a
      href="https://www.instagram.com/enricomalatesta7"
      target="_blank"
      rel="noopener noreferrer"
      >
      @enricomalatesta7
      </a>
      </p>
      </>
    )}
    </section>
    </main>

    <footer className="footer">
    <div className="footer-copy">
    &copy; {new Date().getFullYear()} Enrico Malatesta
    </div>
    <nav className="footer-nav">
    <a href="/">Home</a>
    <a href="/about">About</a>
    <a href={TERMS_URL} target="_blank" rel="noopener noreferrer">
    Terms
    </a>
    <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer">
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

    {/* Scoped styles just for the Instagram line */}
    <style jsx>{`
      .instagram-line {
        margin-top: 0.75rem;
        text-align: center;
        font-style: italic;
        color: #facc15;
      }
      .instagram-line a {
        color: #facc15 !important;
        text-decoration: underline;
      }
      `}</style>
      </div>
  );
}
