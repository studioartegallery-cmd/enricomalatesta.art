"use client";

import { useState } from "react";

type Filter = "all" | "paintings" | "digital";

type Artwork = {
  id: number;
  title: string;
  subtitle: string;
  type: Filter;
  price: string;
};

const ARTWORKS: Artwork[] = [
  {
    id: 1,
    title: "UNTITLED PAINTING II",
    subtitle: "Acrylic on panel · 60 × 60 cm",
    type: "paintings",
    price: "€ 900",
  },
  {
    id: 2,
    title: "DIGITAL FRAGMENT",
    subtitle: "Digital art · 5000 × 3500 px",
    type: "digital",
    price: "€ 520",
  },
];

const R2_BASE = process.env.NEXT_PUBLIC_R2_BASE || "";
const TERMS_URL = R2_BASE ? `${R2_BASE}/admin/terms.pdf` : "#";
const PRIVACY_URL = R2_BASE ? `${R2_BASE}/admin/privacy.pdf` : "#";

export default function HomePage() {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = ARTWORKS.filter((art) =>
    filter === "all" ? true : art.type === filter
  );

  return (
    <div className="page">
      <header className="header">
        <h1 className="site-title">MalatestaArt</h1>
      </header>

      <main className="main">
        <div className="filters">
          <button
            className={`filter-button ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`filter-button ${filter === "paintings" ? "active" : ""}`}
            onClick={() => setFilter("paintings")}
          >
            Paintings
          </button>
          <button
            className={`filter-button ${filter === "digital" ? "active" : ""}`}
            onClick={() => setFilter("digital")}
          >
            Digital Art
          </button>
        </div>

        <section className="grid-wrapper">
          <article className="art-card">
            <div className="art-scroll">
              {filtered.map((art) => (
                <div key={art.id} className="art-block">
                  <div className="art-image placeholder" />
                  <div className="art-meta">
                    <div className="art-title">{art.title}</div>
                    <div className="art-details">{art.subtitle}</div>
                    <div className="art-footer">
                      <span className="art-price">{art.price}</span>
                      <a
                        href="https://studioarte.art"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="buy-button"
                      >
                        Buy
                      </a>
                    </div>
                  </div>
                </div>
              ))}
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
