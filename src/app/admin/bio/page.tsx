"use client";

import { useEffect, useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import Link from "next/link";

const R2_BASE = process.env.NEXT_PUBLIC_R2_BASE || "";
const TERMS_URL = R2_BASE ? `${R2_BASE}/admin/terms.pdf` : "#";
const PRIVACY_URL = R2_BASE ? `${R2_BASE}/admin/privacy.pdf` : "#";

// Always go through the image proxy so we control caching.
const ABOUT_IMAGE_API_URL = "/api/artwork/image?key=admin/about-bio.webp";

export default function AdminBioPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // Load current image on first render for the left-hand preview.
  useEffect(() => {
    setPreviewUrl(`${ABOUT_IMAGE_API_URL}&t=${Date.now()}`);
  }, []);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const nextFile = e.target.files?.[0] ?? null;

    // Revoke previous blob URL if any.
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(nextFile);

    if (nextFile) {
      const blobUrl = URL.createObjectURL(nextFile);
      setPreviewUrl(blobUrl);
    } else {
      // If user clears selection, fall back to the stored image.
      setPreviewUrl(`${ABOUT_IMAGE_API_URL}&t=${Date.now()}`);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!file) {
      setStatus("Please choose an image first.");
      return;
    }

    try {
      setIsSaving(true);
      setStatus(null);

      const formData = new FormData();
      formData.append("aboutImage", file);

      const res = await fetch("/api/admin/about", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Failed to save About image:", txt);
        setStatus("Error saving image. Please try again.");
        return;
      }

      setStatus("Saved successfully.");

      // After successful save, drop the local file and reload from the API
      // with a fresh cache-busting param so the new version appears.
      setFile(null);
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(`${ABOUT_IMAGE_API_URL}&t=${Date.now()}`);
    } catch (err) {
      console.error("Error saving About image:", err);
      setStatus("Unexpected error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="page">
      <header className="header">
        <h1 className="site-title">MalatestaArt</h1>
      </header>

      <main className="main">
        <section className="text-section">
          <h2 className="section-title">Edit About Page</h2>
          <p className="section-text">
            Upload a single designed image that contains your full biography. This image will be
            shown on the public <code>/about</code> page. If no image is uploaded, the site will
            fall back to the built-in text version so the page never breaks.
          </p>

          <div className="admin-panels">
            <div className="admin-panel">
              <h3 className="admin-panel-title">Current About image</h3>
              <div className="admin-preview">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Current About page"
                    className="admin-preview-image"
                  />
                ) : (
                  <div className="admin-preview-placeholder">
                    This preview loads the file stored at{" "}
                    <code>admin/about-bio.webp</code> in your R2 bucket.
                  </div>
                )}
              </div>
            </div>

            <div className="admin-panel">
              <h3 className="admin-panel-title">Upload new About image</h3>
              <form onSubmit={handleSubmit} className="admin-form">
                <label className="form-label" htmlFor="aboutImage">
                  Select About image (.webp recommended)
                </label>
                <input
                  id="aboutImage"
                  name="aboutImage"
                  type="file"
                  accept="image/webp,image/jpeg,image/png"
                  className="file-input"
                  onChange={handleFileChange}
                />

                <button type="submit" className="buy-button" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save About Image"}
                </button>

                {status && <p className="status-text">{status}</p>}
              </form>
            </div>
          </div>


        </section>
      </main>

      <footer className="footer">
        <nav className="footer-nav">
          <a href="/admin">Admin</a>
          <a href="/">Home</a>
          <a href="/about">About</a>
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
