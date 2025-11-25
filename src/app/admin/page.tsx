"use client";

import Link from "next/link";

const R2_BASE = process.env.NEXT_PUBLIC_R2_BASE || "";
const TERMS_URL = R2_BASE ? `${R2_BASE}/admin/terms.pdf` : "#";
const PRIVACY_URL = R2_BASE ? `${R2_BASE}/admin/privacy.pdf` : "#";

export default function AdminPage() {
  return (
    <div className="page">
      <header className="header">
        <h1 className="site-title">MalatestaArt</h1>
      </header>

      <main className="main">
        <section className="text-section">
          <h2 className="section-title">Admin Area</h2>
          <p className="section-text">
            This private area is for managing the content of the site. Use the links below only
            after you have protected <code>/admin</code> with Cloudflare Access.
          </p>
        </section>

        <section className="grid-wrapper">
          <div className="art-grid">
            <article className="art-card">
              <div className="art-meta">
                <div className="art-title">Add Artwork</div>
                <div className="art-details">
                  Create and manage artworks shown on the main grid.
                </div>
                <div className="art-footer">
                  <Link href="/admin/artwork" className="buy-button">
                    Go to Add Artwork
                  </Link>
                </div>
              </div>
            </article>

            <article className="art-card">
              <div className="art-meta">
                <div className="art-title">Add Blog</div>
                <div className="art-details">
                  Create or edit blog posts that appear in the Blog section.
                </div>
                <div className="art-footer">
                  <Link href="/admin/blog" className="buy-button">
                    Go to Add Blog
                  </Link>
                </div>
              </div>
            </article>

            <article className="art-card">
              <div className="art-meta">
                <div className="art-title">Edit Bio</div>
                <div className="art-details">
                  Update your artist biography text used on the site.
                </div>
                <div className="art-footer">
                  <Link href="/admin/bio" className="buy-button">
                    Go to Edit Bio
                  </Link>
                </div>
              </div>
            </article>

            <article className="art-card">
              <div className="art-meta">
                <div className="art-title">Edit Terms &amp; Privacy</div>
                <div className="art-details">
                  Replace or update the legal documents stored in R2.
                </div>
                <div className="art-footer">
                  <Link href="/admin/legal" className="buy-button">
                    Go to Legal Editor
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-copy">&copy; {new Date().getFullYear()} MalatestaArt</div>
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
