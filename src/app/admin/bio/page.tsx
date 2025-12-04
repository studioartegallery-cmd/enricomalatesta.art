"use client";

import { useEffect, useState } from "react";
import type { FormEvent, ChangeEvent } from "react";

const R2_BASE = process.env.NEXT_PUBLIC_R2_BASE || "";
const TERMS_URL = R2_BASE ? `${R2_BASE}/admin/terms.pdf` : "#";
const PRIVACY_URL = R2_BASE ? `${R2_BASE}/admin/privacy.pdf` : "#";

// Always go through the image proxy so we control caching.
const ABOUT_IMAGE_API_URL = "/api/artwork/image?key=admin/about-bio.webp";

type AboutContent = {
  aboutText: string;
  instagram?: string;
  facebook?: string;
  x?: string;
  website?: string;
  email?: string;
};

const defaultAboutContent: AboutContent = {
  aboutText: "",
  instagram: "",
  facebook: "",
  x: "",
  website: "",
  email: "",
};

export default function AdminBioPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [imageStatus, setImageStatus] = useState<string | null>(null);

  const [aboutContent, setAboutContent] = useState<AboutContent>(defaultAboutContent);
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [contentStatus, setContentStatus] = useState<string | null>(null);

  // Load current image + text/socials on first render.
  useEffect(() => {
    setPreviewUrl(`${ABOUT_IMAGE_API_URL}&t=${Date.now()}`);
    void loadAboutContent();
  }, []);

  async function loadAboutContent() {
    try {
      const res = await fetch("/api/admin/about", { method: "GET" });
      if (!res.ok) {
        console.error("Failed to load about content");
        return;
      }

      const data = (await res.json()) as Partial<AboutContent>;

      setAboutContent({
        ...defaultAboutContent,
        ...data,
      });
    } catch (err) {
      console.error("Error loading about content", err);
    }
  }

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

  async function handleImageSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!file) {
      setImageStatus("Please choose an image first.");
      return;
    }

    try {
      setIsSavingImage(true);
      setImageStatus(null);

      const formData = new FormData();
      formData.append("aboutImage", file);

      const res = await fetch("/api/admin/about", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Failed to save About image:", txt);
        setImageStatus("Error saving image. Please try again.");
        return;
      }

      setImageStatus("Saved successfully.");

      // After successful save, drop the local file and reload from the API
      // with a fresh cache-busting param so the new version appears.
      setFile(null);
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(`${ABOUT_IMAGE_API_URL}&t=${Date.now()}`);
    } catch (err) {
      console.error("Error saving About image:", err);
      setImageStatus("Unexpected error. Please try again.");
    } finally {
      setIsSavingImage(false);
    }
  }

  function handleContentChange(field: keyof AboutContent, value: string) {
    setAboutContent((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleContentSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setIsSavingContent(true);
      setContentStatus(null);

      const res = await fetch("/api/admin/about", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(aboutContent),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Failed to save About content:", txt);
        setContentStatus("Error saving content. Please try again.");
        return;
      }

      setContentStatus("Saved successfully.");
    } catch (err) {
      console.error("Error saving About content:", err);
      setContentStatus("Unexpected error. Please try again.");
    } finally {
      setIsSavingContent(false);
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
            Upload a single designed image that contains your full biography, and optionally store
            your About text and social links. The image will be shown on the public <code>/about</code>{" "}
            page. If no image is uploaded, the site will fall back to the built-in text version so the
            page never breaks.
          </p>

          <div className="admin-panels">
            <div className="admin-panel">
              <h3 className="admin-panel-title">Current About image</h3>
              <div className="admin-preview">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="Current About page"
                    className="admin-preview-image"
                  />
                ) : (
                  <div className="admin-preview-placeholder">
                    This preview loads the file stored at <code>admin/about-bio.webp</code> in your R2
                    bucket.
                  </div>
                )}
              </div>
            </div>

            <div className="admin-panel">
              <h3 className="admin-panel-title">Upload new About image</h3>
              <form onSubmit={handleImageSubmit} className="admin-form">
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

                <button type="submit" className="buy-button" disabled={isSavingImage}>
                  {isSavingImage ? "Saving..." : "Save About Image"}
                </button>

                {imageStatus && <p className="status-text">{imageStatus}</p>}
              </form>
            </div>

            <div className="admin-panel">
              <h3 className="admin-panel-title">About content &amp; socials</h3>
              <form onSubmit={handleContentSubmit} className="admin-form">
                <div className="admin-field">
                  <span>About text</span>
                  <textarea
                    rows={6}
                    value={aboutContent.aboutText}
                    onChange={(event) => handleContentChange("aboutText", event.target.value)}
                  />
                </div>

                <div className="admin-field">
                  <span>Instagram</span>
                  <input
                    type="text"
                    placeholder="@username or full URL"
                    value={aboutContent.instagram ?? ""}
                    onChange={(event) => handleContentChange("instagram", event.target.value)}
                  />
                </div>

                <div className="admin-field">
                  <span>Facebook</span>
                  <input
                    type="text"
                    placeholder="Profile or page URL"
                    value={aboutContent.facebook ?? ""}
                    onChange={(event) => handleContentChange("facebook", event.target.value)}
                  />
                </div>

                <div className="admin-field">
                  <span>X (Twitter)</span>
                  <input
                    type="text"
                    placeholder="@username or full URL"
                    value={aboutContent.x ?? ""}
                    onChange={(event) => handleContentChange("x", event.target.value)}
                  />
                </div>

                <div className="admin-field">
                  <span>Website</span>
                  <input
                    type="text"
                    placeholder="https://example.com"
                    value={aboutContent.website ?? ""}
                    onChange={(event) => handleContentChange("website", event.target.value)}
                  />
                </div>

                <div className="admin-field">
                  <span>Email</span>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={aboutContent.email ?? ""}
                    onChange={(event) => handleContentChange("email", event.target.value)}
                  />
                </div>

                <button type="submit" className="buy-button" disabled={isSavingContent}>
                  {isSavingContent ? "Saving..." : "Save About content"}
                </button>

                {contentStatus && <p className="status-text">{contentStatus}</p>}
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
