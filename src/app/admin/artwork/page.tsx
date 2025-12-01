"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Technique =
| "Acrylic on canvas"
| "Acrylic on wooden panel"
| "Acrylic on paper"
| "Digital Art"
| "Mixed Media"
| "Photography"
| "Fine Art Photography";

type Style =
| "Abstract"
| "Abstract Geometric"
| "Minimalist"
| "Figurative"
| "Portraiture"
| "Landscape"
| "Still Life"
| "Realism"
| "Hyperrealism"
| "Impressionism"
| "Post-Impressionism"
| "Expressionism"
| "Abstract Expressionism"
| "Surrealism"
| "Symbolism"
| "Cubism"
| "Futurism"
| "Constructivist"
| "Conceptual"
| "Pop Art"
| "Street Art / Urban"
| "Op Art"
| "Kinetic"
| "Brutalist"
| "Digital / Glitch"
| "Neo-Expressionist";

type ArtworkForm = {
  artist: string;
  title: string;
  style: Style;
  technique: Technique;
  widthCm: string;
  heightCm: string;
  price: string;
  creationDate: string;
  sold: boolean;
  buyUrl: string;
};

type Filter = "all" | "paintings" | "digital";

type ExistingArtwork = {
  id: string;
  title: string;
  subtitle: string;
  type: Filter;
  price: string;
  imageUrl: string;
  artist?: string;
  style?: string;
  technique?: string;
  widthCm?: string;
  heightCm?: string;
  creationDate?: string;
  sold?: string;
  buyUrl?: string;
};

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, base64] = dataUrl.split(",");
  if (!meta || !base64) {
    throw new Error("Invalid data URL");
  }
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  const mimeMatch = /^data:(.*?);base64$/.exec(meta);
  const mime = mimeMatch ? mimeMatch[1] : "image/webp";
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
    creationDate: "",
    sold: false,
    buyUrl: "",
  });

  const [existing, setExisting] = useState<ExistingArtwork[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Load existing artworks once on mount
  useEffect(() => {
    async function loadExisting() {
      try {
        const res = await fetch("/api/admin/artwork");
        if (!res.ok) return;
        const data = (await res.json()) as ExistingArtwork[];
        setExisting(data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error loading existing artworks", err);
      }
    }
    loadExisting();
  }, []);

  // Convert selected file to WebP in the browser
  useEffect(() => {
    if (!file) {
      // When no file is selected, keep whatever preview we already have
      // (for existing artworks) and just stop any conversion spinner.
      setIsConverting(false);
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
    reader.onerror = () => {
      if (!cancelled) {
        setIsConverting(false);
      }
    };
    reader.readAsDataURL(file);

    return () => {
      cancelled = true;
    };
  }, [file]);

  function handleSelectExisting(a: ExistingArtwork) {
    setSelectedId(a.id);
    setForm({
      artist: (a.artist && a.artist.trim()) || "Enrico Malatesta",
      title: a.title || "",
      style: ((a.style || "Abstract") as Style),
      technique: ((a.technique || "Acrylic on canvas") as Technique),
      widthCm: a.widthCm || "",
      heightCm: a.heightCm || "",
      price: a.price || "",
      creationDate: a.creationDate || "",
      sold: a.sold === "1" || a.sold === "true",
      buyUrl: a.buyUrl || "",
    });
    setWebpDataUrl(a.imageUrl || null);
    setFile(null);
  }

  function handleChange<K extends keyof ArtworkForm>(key: K, value: ArtworkForm[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const fd = new FormData();
    fd.append("artist", form.artist);
    fd.append("title", form.title);
    fd.append("style", form.style);
    fd.append("technique", form.technique);
    fd.append("widthCm", form.widthCm);
    fd.append("heightCm", form.heightCm);
    fd.append("price", form.price);
    fd.append("creationDate", form.creationDate);
    fd.append("sold", form.sold ? "1" : "0");
    fd.append("buyUrl", form.buyUrl);

    let method: "POST" | "PUT" = "POST";

    if (selectedId) {
      method = "PUT";
      fd.append("id", selectedId);
    }

    if (!selectedId) {
      if (!webpDataUrl) {
        alert("Upload an image first so the WebP preview is ready.");
        return;
      }
      const blob = dataUrlToBlob(webpDataUrl);
      const filename =
      (form.title || "artwork").replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "artwork";
      fd.append("file", new File([blob], `${filename}.webp`, { type: "image/webp" }));
    } else if (webpDataUrl && file) {
      // Editing: if a new file was chosen, send it; otherwise keep existing binary in R2
      const blob = dataUrlToBlob(webpDataUrl);
      const filename =
      (form.title || "artwork").replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "artwork";
      fd.append("file", new File([blob], `${filename}.webp`, { type: "image/webp" }));
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/artwork", {
        method,
        body: fd,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Upload failed with status ${res.status}`);
      }

      // eslint-disable-next-line no-console
      console.log("Artwork saved to R2");
      alert("Artwork saved.");

      // Refresh list after save
      try {
        const reload = await fetch("/api/admin/artwork");
        if (reload.ok) {
          const data = (await reload.json()) as ExistingArtwork[];
          setExisting(data);
        }
      } catch {
        // ignore refresh failures
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error("Upload error", err);
      alert(`Upload error: ${err?.message || "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteExisting(id: string) {
    if (!window.confirm("Delete this artwork from the site?")) return;

    try {
      const res = await fetch(`/api/admin/artwork?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Delete failed with status ${res.status}`);
      }
      // eslint-disable-next-line no-console
      console.log("Artwork deleted from R2");
      alert("Artwork deleted.");
      setExisting((prev) => prev.filter((item) => item.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
        setForm({
          artist: "Enrico Malatesta",
          title: "",
          style: "Abstract",
          technique: "Acrylic on canvas",
          widthCm: "",
          heightCm: "",
          price: "",
          creationDate: "",
          sold: false,
          buyUrl: "",
        });
        setWebpDataUrl(null);
        setFile(null);
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error("Delete error", err);
      alert(`Delete error: ${err?.message || "Unknown error"}`);
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
    Upload an image (keep it under 20&nbsp;MB), we convert it to WebP in the background
    and show a preview. Then fill in the details and save. Editing and deletion will later
    be wired to real storage.
    </p>
    </section>

    <section className="admin-grid">
    {/* Left: upload & preview */}
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
      <div className="admin-preview-placeholder">
      Preview will appear here after upload.
      </div>
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
    <option value="Abstract Geometric">Abstract Geometric</option>
    <option value="Minimalist">Minimalist</option>
    <option value="Figurative">Figurative</option>
    <option value="Portraiture">Portraiture</option>
    <option value="Landscape">Landscape</option>
    <option value="Still Life">Still Life</option>
    <option value="Realism">Realism</option>
    <option value="Hyperrealism">Hyperrealism</option>
    <option value="Impressionism">Impressionism</option>
    <option value="Post-Impressionism">Post-Impressionism</option>
    <option value="Expressionism">Expressionism</option>
    <option value="Abstract Expressionism">Abstract Expressionism</option>
    <option value="Surrealism">Surrealism</option>
    <option value="Symbolism">Symbolism</option>
    <option value="Cubism">Cubism</option>
    <option value="Futurism">Futurism</option>
    <option value="Constructivist">Constructivist</option>
    <option value="Conceptual">Conceptual</option>
    <option value="Pop Art">Pop Art</option>
    <option value="Street Art / Urban">Street Art / Urban</option>
    <option value="Op Art">Op Art</option>
    <option value="Kinetic">Kinetic</option>
    <option value="Brutalist">Brutalist</option>
    <option value="Digital / Glitch">Digital / Glitch</option>
    <option value="Neo-Expressionist">Neo-Expressionist</option>
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
    <option value="Digital Art">Digital Art</option>
    <option value="Mixed Media">Mixed Media</option>
    <option value="Photography">Photography</option>
    <option value="Fine Art Photography">Fine Art Photography</option>
    </select>
    </label>

    <div className="admin-size-row">
    <label className="admin-field admin-size-field">
    <span>Size (cm)</span>
    <div className="admin-size-inputs">
    <input
    type="text"
    placeholder="W"
    value={form.widthCm}
    onChange={(e) => handleChange("widthCm", e.target.value)}
    />
    <span className="admin-size-times">×</span>
    <input
    type="text"
    placeholder="H"
    value={form.heightCm}
    onChange={(e) => handleChange("heightCm", e.target.value)}
    />
    <span>cm</span>
    </div>
    </label>
    </div>

    <label className="admin-field">
    <span>
    Price <small>(same in € / $)</small>
    </span>
    <div className="admin-price-row">
    <span className="admin-price-prefix">€/ $</span>
    <input
    type="text"
    value={form.price}
    onChange={(e) => handleChange("price", e.target.value)}
    />
    </div>
    <p className="admin-note">
    Display format suggestion: €{pricePreview} / ${pricePreview}.
    </p>
    </label>

    <label className="admin-field admin-field-date">
    <span>Creation Date</span>
    <input
      type="date"
      value={form.creationDate}
      onChange={(e) => handleChange("creationDate", e.target.value)}
    />
    </label>

    <label className="admin-field admin-field-inline">
    <span>Sold</span>
    <input
      type="checkbox"
      checked={form.sold}
      onChange={(e) => handleChange("sold", e.target.checked)}
    />
    </label>

    <label className="admin-field">
    <span>Buy URL (optional)</span>
    <input
      type="text"
      value={form.buyUrl}
      onChange={(e) => handleChange("buyUrl", e.target.value)}
      placeholder="https://studioarte.art"
    />
    <p className="admin-note">
      If empty, the Buy button links to studioarte.art.
    </p>
    </label>


    <button type="submit" className="buy-button" disabled={isSaving}>
    {isSaving ? "Saving…" : "Save artwork to R2"}
    </button>
    </form>
    </section>

    {/* Existing artworks */}
    <section className="admin-existing">
    <h3 className="admin-panel-title">3. Edit / Delete</h3>
    <p className="admin-note">
    Select an artwork to load its details above for editing, or delete it completely from
    the site.
    </p>

    <ul className="admin-existing-list">
    {existing.map((a) => (
      <li
      key={a.id}
      className={`admin-existing-item ${selectedId === a.id ? "selected" : ""}`}
      >
      <button
      type="button"
      className="admin-existing-button"
      onClick={() => handleSelectExisting(a)}
      >
      {a.title || "Untitled"}
      </button>
      <button
      type="button"
      className="admin-delete-button"
      onClick={() => handleDeleteExisting(a.id)}
      >
      Delete from site
      </button>
      </li>
    ))}
    </ul>
    </section>


    </main>

    <footer className="footer">
    <nav className="footer-nav">
    <a href="/admin">Admin</a>
    <a href="/">Home</a>
    <a href="/about">About</a>
    <a href="/blog">Blog</a>
    </nav>
    </footer>
    </div>
  );
}
