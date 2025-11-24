"use client";

import React from "react";

const ARTWORKS = [
  {
    id: 1,
    type: "paintings",
    title: "Untitled Painting",
    details: "Acrylic on canvas · 80 × 80 cm",
    price: "€ 1,200",
  },
  {
    id: 2,
    type: "digital",
    title: "Digital Study #1",
    details: "Digital art · 4000 × 4000 px",
    price: "€ 480",
  },
  {
    id: 3,
    type: "paintings",
    title: "Untitled Painting II",
    details: "Acrylic on panel · 60 × 60 cm",
    price: "€ 900",
  },
  {
    id: 4,
    type: "digital",
    title: "Digital Fragment",
    details: "Digital art · 5000 × 3500 px",
    price: "€ 520",
  },
];

type Filter = "all" | "paintings" | "digital";

export default function HomePage() {
  const [filter, setFilter] = React.useState<Filter>("all");

  const filtered = ARTWORKS.filter((art) =>
    filter === "all" ? true : art.type === filter
  );

  return (
    <div className="page">
      <header className="header">
        <h1 className="site-title">MalatestaArt</h1>
      </header>

      <main className="main">
        <section className="filters">
          <button
            className={["filter-button", filter === "all" && "active"].filter(Boolean).join(" ")}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={["filter-button", filter === "paintings" && "active"].filter(Boolean).join(" ")}
            onClick={() => setFilter("paintings")}
          >
            Paintings
          </button>
          <button
            className={["filter-button", filter === "digital" && "active"].filter(Boolean).join(" ")}
            onClick={() => setFilter("digital")}
          >
            Digital Art
          </button>
        </section>

        <section className="grid-wrapper">
          <div className="art-grid">
            {filtered.map((art) => (
              <article key={art.id} className="art-card">
                <div className="art-image placeholder">Image</div>
                <div className="art-meta">
                  <div className="art-title">{art.title}</div>
                  <div className="art-details">{art.details}</div>
                  <div className="art-price">{art.price}</div>
                </div>
                <a
                  className="buy-button"
                  href="https://studioarte.art"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buy
                </a>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <nav className="footer-nav">
          <a href="#contact">About</a>
          <a href="#terms">Terms</a>
          <a href="#privacy">Privacy</a>
          <a href="#cookies">Cookies</a>
          <a href="#blog">Blog</a>
        </nav>
      </footer>
    </div>
  );
}
