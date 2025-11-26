"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Technique =
  | "Acrylic on canvas"
  | "Acrylic on wooden panel"
  | "Acrylic on paper"
  | "Other";

type Style =
  | "Abstract"
  | "Figurative"
  | "Landscape"
  | "Portrait"
  | "Geometric"
  | "Other";

type ArtworkForm = {
  artist: string;
  title: string;
  style: Style;
  technique: Technique;
  widthCm: string;
  heightCm: string;
  price: string;
};

type ExistingArtwork = {
  id: string;
  title: string;
  thumbnailUrl: string;
};

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, data] = dataUrl.split(",");
  const mimeMatch = meta.match(/data:(.*?);base64/);
  const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
  const binary = atob(data);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export default function AdminArtworkPage() {
  const [file, setFile] = useState<File | null>(null);
  const [webpDataUrl, setWebpDataUrl] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState<ArtworkForm>({
    artist: "Enrico Malatesta",
    title: "",
    style: "Abstract",
    technique: "Acrylic on canvas",
    widthCm: "",
    heightCm: "",
    price: "",
  });

  // Placeholder list for now – this will later be loaded from real storage.
  const [existing] = useState<ExistingArtwork[]>([
    {
      id: "demo-1",
      title: "Sample artwork (demo only)",
      thumbnailUrl: "",
    },
  ]);

  // Convert the selected file to WebP in the browser as a background step.
  useEffect(() => {
    if (!file) {
      setWebpDataUrl(null);
      return;
    }

    let cancelled = false;
    setIsConverting(true);

    const reader = new FileReader();
    reader.onload = () => {
      if (cancelled) return;
      const img = new Image();
      img.onload = () => {
        if (cancelled) return;
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setIsConverting(false);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const webp = canvas.toDataURL("image/webp", 0.9);
        if (!cancelled) {
          setWebpDataUrl(webp);
          setIsConverting(false);
        }
      };
      if (typeof reader.result === "string") {
        img.src = reader.result;
      } else {
        setIsConverting(false);
      }
    };
    reader.readAsDataURL(file);

    return () => {
      cancelled = true;
    };
  }, [file]);

  function handleSelectExisting(a: ExistingArtwork) {
    // For now we just populate the title – real implementation will load all fields.
    setForm((prev) => ({
      ...prev,
      title: a.title,
    }));
  }

  function handleChange<K extends keyof ArtworkForm>(key: K, value: ArtworkForm[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!webpDataUrl) {
      alert("Upload an image first so the WebP preview is ready.");
      return;
    }

    const blob = dataUrlToBlob(webpDataUrl);
    const filename = (form.title || "artwork").replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "artwork";

    const fd = new FormData();
    fd.append("file", new File([blob], `${filename}.webp`, { type: "image/webp" }));
    fd.append("artist", form.artist);
    fd.append("title", form.title);
    fd.append("style", form.style);
    fd.append("technique", form.technique);
    fd.append("widthCm", form.widthCm);
    fd.append("heightCm", form.heightCm);
    fd.append("price", form.price);

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/artwork", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Upload failed with status ${res.status}`);
      }

      const data: any = await res.json();
      // eslint-disable-next-line no-console
      console.log("Artwork saved to R2:", data);
      alert("Artwork uploaded to R2 (key stored in console).");
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error("Upload error", err);
      alert(`Upload error: ${err?.message || "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  }

  const pricePreview = form.price || "3000";

  return (
    <div className="page">
      <header className="header">
        <h1 className="site-title">MalatestaArt</h1>
      </header>

      <main className="main">
        <section className="text-section">
          <h2 className="section-title">Add / Edit Artwork</h2>
          <p className="section-text">
            Upload an image (keep it under 20&nbsp;MB), we convert it to WebP in the background and
            show a preview. Then fill in the details and save. Editing and deletion will later be
            wired to real storage.
          </p>
        </section>

        <section className="admin-two-column">
          {/* Left: upload + preview */}
          <div className="admin-panel">
            <h3 className="admin-panel-title">1. Upload &amp; Preview</h3>
            <label className="admin-file-label">
              <span>Select artwork image (local disk)</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setFile(f);
                }}
              />
            </label>
            <p className="admin-note">
              Note: keep files reasonably small (around 20&nbsp;MB max). Conversion to WebP happens
              in the background in your browser.
            </p>

            <div className="admin-preview">
              {isConverting && <div className="admin-preview-status">Converting to WebP…</div>}
              {!isConverting && webpDataUrl && (
                <img src={webpDataUrl} alt="Artwork preview" className="admin-preview-image" />
              )}
              {!isConverting && !webpDataUrl && (
                <div className="admin-preview-placeholder">Preview will appear here after upload.</div>
              )}
            </div>
          </div>

          {/* Right: details form */}
          <form className="admin-panel admin-form" onSubmit={handleSubmit}>
            <h3 className="admin-panel-title">2. Details</h3>

            <label className="admin-field">
              <span>Title</span>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </label>

            <label className="admin-field">
              <span>Style</span>
              <select
                value={form.style}
                onChange={(e) => handleChange("style", e.target.value as Style)}
              >
                <option value="Abstract">Abstract</option>
                <option value="Figurative">Figurative</option>
                <option value="Landscape">Landscape</option>
                <option value="Portrait">Portrait</option>
                <option value="Geometric">Geometric</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label className="admin-field">
              <span>Technique</span>
              <select
                value={form.technique}
                onChange={(e) => handleChange("technique", e.target.value as Technique)}
              >
                <option value="Acrylic on canvas">Acrylic on canvas</option>
                <option value="Acrylic on wooden panel">Acrylic on wooden panel</option>
                <option value="Acrylic on paper">Acrylic on paper</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <div className="admin-field admin-size-fields">
              <span>Size (cm)</span>
              <div className="admin-size-inputs">
                <label>
                  W
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.widthCm}
                    onChange={(e) => handleChange("widthCm", e.target.value)}
                  />
                </label>
                <span className="admin-size-separator">×</span>
                <label>
                  H
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.heightCm}
                    onChange={(e) => handleChange("heightCm", e.target.value)}
                  />
                </label>
                <span className="admin-size-unit">cm</span>
              </div>
            </div>

            <div className="admin-field admin-price-fields">
              <span>Price (same in € / $)</span>
              <div className="admin-price-inputs">
                <label>
                  €/$
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                  />
                </label>
              </div>
              <p className="admin-note small">
                Display format suggestion: €{pricePreview} / ${pricePreview}.
              </p>
            </div>

            <div className="admin-actions">
              <button type="submit" className="buy-button" disabled={isSaving}>
                {isSaving ? "Saving…" : "Save artwork to R2"}
              </button>
            </div>
          </form>
        </section>

        {/* Existing artworks (Edit / Delete placeholder) */}
        <section className="admin-existing">
          <h3 className="admin-panel-title">3. Edit / Delete (placeholder)</h3>
          <p className="admin-note">
            This will later show the real list of artworks already on the site so you can select one
            to edit or mark as deleted (removed from the website, kept in storage). For now there is
            just a demo row.
          </p>
          <ul className="admin-existing-list">
            {existing.map((a) => (
              <li key={a.id} className="admin-existing-item">
                <button
                  type="button"
                  className="admin-existing-button"
                  onClick={() => handleSelectExisting(a)}
                >
                  <span className="admin-existing-title">{a.title}</span>
                  <span className="admin-existing-meta">(demo)</span>
                </button>
                <button
                  type="button"
                  className="admin-delete-button"
                  onClick={() => alert("Delete will be wired to real storage later.")}
                >
                  Delete from site
                </button>
              </li>
            ))}
          </ul>
        </section>

        <div className="admin-back-row">
          <Link href="/admin" className="buy-button">
            ← Back to Admin
          </Link>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-copy">&copy; {new Date().getFullYear()} MalatestaArt</div>
        <nav className="footer-nav">
          <a href="/about">About</a>
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <a href="/blog">Blog</a>
        </nav>
      </footer>
    </div>
  );
}
