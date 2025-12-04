"use client";

import { useEffect, useMemo, useState } from "react";

const R2_BASE = process.env.NEXT_PUBLIC_R2_BASE || "";
const TERMS_URL = R2_BASE ? `${R2_BASE}/admin/terms.pdf` : "#";
const PRIVACY_URL = R2_BASE ? `${R2_BASE}/admin/privacy.pdf` : "#";

// About image is always stored at this fixed key in the R2 bucket.
const ABOUT_IMAGE_URL = "/api/artwork/image?key=admin/about-bio.webp";

type AboutContent = {
  aboutText: string;
  instagram?: string;
  facebook?: string;
  x?: string;
  website?: string;
  email?: string;
};

const emptyContent: AboutContent = {
  aboutText: "",
  instagram: "",
  facebook: "",
  x: "",
  website: "",
  email: "",
};

function normaliseInstagramLink(value: string | undefined | null): {
  label: string;
  href?: string;
} {
  if (!value) {
    return { label: "", href: undefined };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return { label: "", href: undefined };
  }

  // If it's already a full URL, just use it.
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return { label: trimmed, href: trimmed };
  }

  // If it looks like "@username", link to instagram.com/username
  const username = trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;
  const href = `https://www.instagram.com/${username}`;

  return { label: `@${username}`, href };
}

export default function AboutClient() {
  const [showFallbackImage, setShowFallbackImage] = useState(false);
  const [imageSrc] = useState(() => `${ABOUT_IMAGE_URL}&t=${Date.now()}`);

  const [aboutContent, setAboutContent] = useState<AboutContent>(emptyContent);
  const [hasLoadedContent, setHasLoadedContent] = useState(false);

  const startYear = 2025;
  const currentYear = new Date().getFullYear();
  const yearText =
    currentYear > startYear ? `${startYear}–${currentYear}` : `${startYear}`;

  useEffect(() => {
    async function loadAbout() {
      try {
        const res = await fetch("/api/admin/about", { method: "GET" });
        if (!res.ok) {
          console.error("Failed to load /api/admin/about");
          setHasLoadedContent(true);
          return;
        }

        const data = (await res.json()) as Partial<AboutContent>;

        setAboutContent({
          ...emptyContent,
          ...data,
          aboutText: typeof data.aboutText === "string" ? data.aboutText : "",
        });
        setHasLoadedContent(true);
      } catch (err) {
        console.error("Error loading /api/admin/about", err);
        setHasLoadedContent(true);
      }
    }

    void loadAbout();
  }, []);

  const aboutParagraphs = useMemo(() => {
    const source = aboutContent.aboutText?.trim();
    if (!source) {
      return [];
    }

    return source
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }, [aboutContent.aboutText]);

  const instagramLink = useMemo(
    () => normaliseInstagramLink(aboutContent.instagram),
    [aboutContent.instagram]
  );

  const hasAnySocial =
    !!aboutContent.instagram ||
    !!aboutContent.facebook ||
    !!aboutContent.x ||
    !!aboutContent.website ||
    !!aboutContent.email;

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
          <div className="about-layout">
            {!showFallbackImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc}
                alt="About Enrico Malatesta"
                className="about-bio-image"
                onError={() => setShowFallbackImage(true)}
              />
            )}

            <div className="about-text">
              {aboutParagraphs.length > 0 ? (
                aboutParagraphs.map((p, idx) => (
                  <p key={idx} className="section-text">
                    {p}
                  </p>
                ))
              ) : (
                <>
                  <p className="section-text">
                    Enrico Malatesta is a visual and digital artist working
                    between acrylic painting and contemporary mixed media. His
                    practice moves freely between precise geometric structures
                    and more intuitive, gestural compositions, often combining
                    traditional techniques with digital experimentation.
                  </p>
                  <p className="section-text">
                    This page will later be replaced by a designed bio text
                    managed from the admin area. Until then, this text acts as a
                    permanent fallback so the About section always stays
                    readable, even if no content has been saved yet.
                  </p>
                </>
              )}

              <div className="about-socials">
                {instagramLink.label && (
                  <p className="instagram-line">
                    Instagram:{" "}
                    {instagramLink.href ? (
                      <a
                        href={instagramLink.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {instagramLink.label}
                      </a>
                    ) : (
                      instagramLink.label
                    )}
                  </p>
                )}

                {aboutContent.facebook && (
                  <p className="about-social-line">
                    Facebook:{" "}
                    <a
                      href={aboutContent.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {aboutContent.facebook}
                    </a>
                  </p>
                )}

                {aboutContent.x && (
                  <p className="about-social-line">
                    X (Twitter):{" "}
                    <a
                      href={aboutContent.x}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {aboutContent.x}
                    </a>
                  </p>
                )}

                {aboutContent.website && (
                  <p className="about-social-line">
                    Website:{" "}
                    <a
                      href={aboutContent.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {aboutContent.website}
                    </a>
                  </p>
                )}

                {aboutContent.email && (
                  <p className="about-social-line">
                    Email:{" "}
                    <a href={`mailto:${aboutContent.email}`}>
                      {aboutContent.email}
                    </a>
                  </p>
                )}

                {!hasAnySocial && hasLoadedContent && (
                  <p className="about-social-line muted">
                    No social links have been added yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-copy">&copy; {yearText} Enrico Malatesta</div>
        <nav className="footer-nav">
          <a href="/">Home</a>
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

      <style jsx>{`
        .about-layout {
          position: relative;
          max-width: 880px;
          margin: 0 auto;
        }

        .about-bio-image {
          max-width: 180px;
          border-radius: 1.5rem;
          float: left;
          margin-right: 2rem;
          margin-bottom: 1.5rem;
        }

        .about-text::after {
          content: "";
          display: block;
          clear: both;
        }

        .instagram-line {
          margin-top: 0.75rem;
          font-style: italic;
          color: #facc15;
        }

        .instagram-line a {
          color: #facc15 !important;
          text-decoration: underline;
        }

        .about-socials {
          margin-top: 1.5rem;
        }

        .about-social-line {
          margin-top: 0.25rem;
          font-size: 0.95rem;
          opacity: 0.9;
        }

        .about-social-line a {
          text-decoration: underline;
        }

        .about-social-line.muted {
          opacity: 0.7;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .about-layout {
            max-width: 100%;
          }

          .about-bio-image {
            float: none;
            display: block;
            max-width: 220px;
            margin-left: auto;
            margin-right: auto;
            margin-bottom: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
