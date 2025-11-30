"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
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

export default function AdminBlogPage() {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [published, setPublished] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function loadPosts() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/blog", { cache: "no-store" });
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

  useEffect(() => {
    loadPosts();
  }, []);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("excerpt", excerpt.trim());
      formData.append("body", body.trim());
      formData.append("published", published ? "true" : "false");
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch("/api/admin/blog", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to save blog post");
      }

      setTitle("");
      setExcerpt("");
      setBody("");
      setPublished(true);
      setImageFile(null);
      setImagePreview(null);

      await loadPosts();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const ok = window.confirm("Delete this blog post?");
    if (!ok) return;

    try {
      const res = await fetch(`/api/admin/blog?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) {
        throw new Error("Failed to delete blog post");
      }
      await loadPosts();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="page">
      <header className="header">
        <h1 className="site-title">MalatestaArt</h1>
      </header>

      <main className="main">
        <section className="text-section">
          <h2 className="section-title">Admin &ndash; Blog</h2>
          <p className="section-text">
            Create and manage blog posts that appear on the public Blog page. The most recent
            published post will always appear first.
          </p>
        </section>

        <section className="admin-grid">
          {/* Left: form */}
          <div className="admin-panel">
            <h3 className="admin-panel-title">1. New blog post</h3>
            <p className="admin-note">
              Fill in the fields below. The image is optional but recommended.
            </p>

            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="admin-field">
                <span>Title</span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="admin-field">
                <span>Excerpt (short intro)</span>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                  style={{ resize: "vertical" }}
                  required
                />
              </div>

              <div className="admin-field">
                <span>Body (optional full text)</span>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  style={{ resize: "vertical" }}
                  placeholder="You can leave this empty if you only want a short excerpt."
                />
              </div>

              <div className="admin-field">
                <span>Image (optional)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="file-input"
                  onChange={handleImageChange}
                />
              </div>

              <div className="admin-field">
                <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                  />
                  <span>Published</span>
                </label>
              </div>

              <button type="submit" className="buy-button" disabled={isSaving}>
                {isSaving ? "Saving…" : "Save blog post"}
              </button>
            </form>
          </div>

          {/* Right: preview */}
          <div className="admin-panel">
            <h3 className="admin-panel-title">2. Preview image</h3>
            <div className="admin-preview">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="admin-preview-image" />
              ) : (
                <div className="admin-preview-placeholder">
                  Select an image file to see a preview here.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Existing posts */}
        <section className="admin-existing">
          <h3 className="admin-panel-title">3. Existing posts</h3>
          <p className="admin-note">
            The list is ordered from newest to oldest based on the creation date.
          </p>

          {isLoading ? (
            <p className="admin-note">Loading…</p>
          ) : posts.length === 0 ? (
            <p className="admin-note">No blog posts yet.</p>
          ) : (
            <ul className="admin-existing-list">
              {posts.map((post) => (
                <li key={post.id} className="admin-existing-item">
                  <button type="button" className="admin-existing-button">
                    {post.title}
                    {post.published ? "" : " (draft)"}
                  </button>
                  <button
                    type="button"
                    className="admin-delete-button"
                    onClick={() => handleDelete(post.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="admin-back-row">
          <Link href="/" className="buy-button">
            ← Back to Home
          </Link>
          <Link href="/admin" className="buy-button">
            ← Back to Admin
          </Link>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-copy">&copy; {new Date().getFullYear()} Enrico Malatesta</div>
        <nav className="footer-links">
          <a href={TERMS_URL} target="_blank" rel="noreferrer">
            Terms
          </a>
          <a href={PRIVACY_URL} target="_blank" rel="noreferrer">
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
