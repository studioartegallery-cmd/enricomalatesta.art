"use client";

import { useEffect, useState } from "react";

type Filter = "all" | "paintings" | "digital";

type Artwork = {
  id: string;
  title: string;
  subtitle: string;
  type: Filter;
  price: string;
  imageUrl?: string;
  creationDate?: string;
  sold?: string;
  buyUrl?: string;
};

const R2_BASE = process.env.NEXT_PUBLIC_R2_BASE || "";
const TERMS_URL = R2_BASE ? `${R2_BASE}/admin/terms.pdf` : "#";
const PRIVACY_URL = R2_BASE ? `${R2_BASE}/admin/privacy.pdf` : "#";

export default function HomeClient() {
  const [filter, setFilter] = useState<Filter>("all");
  const [artworks, setArtworks] = useState<Artwork[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/artwork");
        if (!res.ok) {
          console.error("HomePage: /api/admin/artwork status", res.status);
          setArtworks([]);
          return;
        }
        const data = (await res.json()) as Artwork[];
        if (Array.isArray(data)) {
          setArtworks(data);
        } else {
          setArtworks([]);
        }
      } catch (err) {
        console.error("HomePage: error loading artworks", err);
        setArtworks([]);
      }
    }

    load();
  }, []);

  const filtered = artworks.filter((art) =>
    filter === "all" ? true : art.type === filter
  );

  return (
    <div className="page">
      <header className="header">
        <h1 className="site-title">MalatestaArt</h1>
      </header>

      <nav className="top-links">
        <a href="/about">About</a>
        <a href="/blog">Blog</a>
      </nav>

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
                  <div className="art-image placeholder">
                    {art.imageUrl && <img src={art.imageUrl} alt={art.title} />}
                  </div>
                  <div className="art-meta">
                    <div className="art-title">{art.title}</div>
                    <div className="art-details">{art.subtitle}</div>
                    <div className="art-footer">
                      <span className="art-price">€/$ {art.price}</span>
                      <a
                        href={
                          art.buyUrl && art.buyUrl.trim()
                            ? art.buyUrl
                            : "https://studioarte.art"
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="buy-button"
                      >
                        {art.sold === "1" || art.sold === "true"
                          ? "Sold"
                          : "Buy"}
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
        <div className="footer-copy">
          &copy; {new Date().getFullYear()} Enrico Malatesta
        </div>
        <nav className="footer-nav">
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
    </div>
  );
}
