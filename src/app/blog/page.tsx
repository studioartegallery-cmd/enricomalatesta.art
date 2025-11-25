"use client";

import Link from "next/link";

const R2_BASE = process.env.NEXT_PUBLIC_R2_BASE || "";
const TERMS_URL = R2_BASE ? `${R2_BASE}/admin/terms.pdf` : "#";
const PRIVACY_URL = R2_BASE ? `${R2_BASE}/admin/privacy.pdf` : "#";

export default function BlogPage() {
  return (
    <div className="page">
      <header className="header">
        <h1 className="site-title">MalatestaArt</h1>
      </header>

      <main className="main">
        <section className="grid-wrapper">
          <article className="art-card">
            <div className="art-meta">
              <div className="art-title">Blog</div>
              <div className="art-details" style={{ marginTop: "8px" }}>
                This space will host short notes, updates, and thoughts about my work,
                exhibitions, and projects. For now, everything you see here is just
                a placeholder so we can finalize the layout.
              </div>
              <div className="art-details" style={{ marginTop: "12px" }}>
                • Upcoming post #1 – Working title and date<br />
                • Upcoming post #2 – Working title and date<br />
                • Upcoming post #3 – Working title and date
              </div>
              <div className="art-details" style={{ marginTop: "16px" }}>
                Once the site is live, this page will be replaced with real entries.
              </div>
            </div>
          </article>
        </section>
      </main>

      <footer className="footer">
        <nav className="footer-nav">
          <a href="/about">About</a>
          <a href={TERMS_URL} download>
            Terms
          </a>
          <a href={PRIVACY_URL} download>
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
