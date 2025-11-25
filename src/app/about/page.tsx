"use client";

import Link from "next/link";

const R2_BASE = process.env.NEXT_PUBLIC_R2_BASE || "";
const TERMS_URL = R2_BASE ? `${R2_BASE}/admin/terms.pdf` : "#";
const PRIVACY_URL = R2_BASE ? `${R2_BASE}/admin/privacy.pdf` : "#";

export default function AboutPage() {
  return (
    <div className="page">
      <header className="header">
        <h1 className="site-title">MalatestaArt</h1>
      </header>

      <main className="main">
        <section className="grid-wrapper">
          <article className="art-card">
            <div className="art-meta">
              <div className="art-title">About Enrico Malatesta</div>
              <div className="art-details">
                Enrico Malatesta (b. 1953) is a visual and digital artist who works primarily with
                acrylic on canvas, wooden panels, and hybrid digital compositions. His practice
                bridges traditional studio painting with contemporary digital experimentation,
                often translating virtual studies into physical works and vice versa.
              </div>
              <div className="art-details" style={{ marginTop: "8px" }}>
                After formative studies at the Académie des Beaux-Arts de Boitsfort in Brussels in
                the 1970s, Enrico developed a personal language rooted in geometry, colour fields,
                and layered surfaces. He currently lives and works between Europe and Asia, building
                an evolving body of work that moves between abstraction, narrative fragments, and
                architectural rhythms.
              </div>
              <div className="art-details" style={{ marginTop: "12px" }}>
                For enquiries, commissions, or exhibition opportunities you can reach him directly:
              </div>
              <div className="art-details" style={{ marginTop: "4px" }}>
                Email:{" "}
                <a
                  href="mailto:enricomalatesta53@gmail.com"
                  style={{ color: "#fbbf24" }}
                >
                  enricomalatesta53@gmail.com
                </a>
              </div>
              <div className="art-details">
                Instagram:{" "}
                <a
                  href="https://www.instagram.com/enricomalatesta7"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#fbbf24" }}
                >
                  @enricomalatesta7
                </a>
              </div>
              <div className="art-details" style={{ marginTop: "16px" }}>
                <Link href="/" style={{ color: "#fbbf24", textDecoration: "none" }}>
                  ← Back to Home
                </Link>
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
