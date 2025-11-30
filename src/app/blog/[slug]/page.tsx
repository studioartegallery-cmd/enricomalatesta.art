'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export const runtime = 'edge';

const R2_BASE = process.env.NEXT_PUBLIC_R2_BASE || '';
const TERMS_URL = R2_BASE ? `${R2_BASE}/admin/terms.pdf` : '#';
const PRIVACY_URL = R2_BASE ? `${R2_BASE}/admin/privacy.pdf` : '#';

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

export default function BlogDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? '';

  const [post, setPost] = useState<BlogPost | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const consentCookie = document.cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('emart_cookie_consent='));

    if (consentCookie?.includes('accepted')) {
      setHasConsent(true);
    }
  }, []);

  useEffect(() => {
    if (!slug) return;

    async function load() {
      try {
        const res = await fetch(`/api/blog?slug=${encodeURIComponent(slug)}`, {
          cache: 'no-store',
        });

        if (!res.ok) {
          if (res.status === 404) {
            setNotFound(true);
            return;
          }
          throw new Error('Failed to load blog post');
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
    : '';

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
            <h2 className="section-title">{post.title}</h2>
            <p className="section-text meta-text">
              {dateText && <span className="meta-item">{dateText}</span>}
            </p>
            {imageUrl && (
              <div className="blog-image-wrapper">
                <img
                  src={imageUrl}
                  alt={post.title}
                  className="blog-image"
                  loading="lazy"
                />
              </div>
            )}
            <p className="section-text excerpt-text">{post.excerpt}</p>
            {post.body && (
              <div className="section-text blog-body">
                {post.body.split('\n').map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            )}
            <div className="admin-back-row">
              <Link href="/blog" className="buy-button">
                ← Back to Blog
              </Link>
              <Link href="/" className="buy-button">
                ← Back to Home
              </Link>
            </div>
          </section>
        )}
      </main>

      {!hasConsent && (
        <div className="cookie-banner">
          <p className="cookie-text">
            This site uses cookies only for essential functionality. No tracking
            or analytics are used.
          </p>
          <div className="cookie-buttons">
            <button
              className="buy-button"
              onClick={() => {
                document.cookie =
                  'emart_cookie_consent=accepted; max-age=31536000; path=/';
                setHasConsent(true);
              }}
            >
              Accept
            </button>
            <button
              className="buy-button secondary"
              onClick={() => {
                document.cookie =
                  'emart_cookie_consent=declined; max-age=31536000; path=/';
                setHasConsent(true);
              }}
            >
              Decline
            </button>
          </div>
        </div>
      )}

      <footer className="footer">
        <nav className="footer-links">
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
                'emart_cookie_consent=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
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
