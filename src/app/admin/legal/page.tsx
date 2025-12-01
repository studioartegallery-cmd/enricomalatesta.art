"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import Link from "next/link";

const R2_BASE = process.env.NEXT_PUBLIC_R2_BASE || "";
const TERMS_URL = R2_BASE ? `${R2_BASE}/admin/terms.pdf` : "#";
const PRIVACY_URL = R2_BASE ? `${R2_BASE}/admin/privacy.pdf` : "#";

export default function AdminLegalPage() {
  const [termsFile, setTermsFile] = useState<File | null>(null);
  const [privacyFile, setPrivacyFile] = useState<File | null>(null);
  const [isSavingTerms, setIsSavingTerms] = useState(false);
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);
  const [statusTerms, setStatusTerms] = useState<string | null>(null);
  const [statusPrivacy, setStatusPrivacy] = useState<string | null>(null);

  function handleTermsChange(e: ChangeEvent<HTMLInputElement>) {
    const nextFile = e.target.files?.[0] ?? null;
    setTermsFile(nextFile);
  }

  function handlePrivacyChange(e: ChangeEvent<HTMLInputElement>) {
    const nextFile = e.target.files?.[0] ?? null;
    setPrivacyFile(nextFile);
  }

  async function handleTermsSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!termsFile) {
      setStatusTerms("Please choose a PDF file named terms.pdf.");
      return;
    }

    if (termsFile.name.toLowerCase() != "terms.pdf") {
      setStatusTerms("Mandatory file name is terms.pdf.");
      return;
    }

    try {
      setIsSavingTerms(true);
      setStatusTerms(null);

      const formData = new FormData();
      formData.append("file", termsFile);

      const res = await fetch("/api/admin/legal", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to upload terms.pdf:", text);
        setStatusTerms("Error uploading terms.pdf. Please try again.");
        return;
      }

      setStatusTerms("terms.pdf uploaded successfully.");
    } catch (err) {
      console.error("Unexpected error uploading terms.pdf", err);
      setStatusTerms("Unexpected error. Please try again.");
    } finally {
      setIsSavingTerms(false);
    }
  }

  async function handlePrivacySubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!privacyFile) {
      setStatusPrivacy("Please choose a PDF file named privacy.pdf.");
      return;
    }

    if (privacyFile.name.toLowerCase() != "privacy.pdf") {
      setStatusPrivacy("Mandatory file name is privacy.pdf.");
      return;
    }

    try {
      setIsSavingPrivacy(true);
      setStatusPrivacy(null);

      const formData = new FormData();
      formData.append("file", privacyFile);

      const res = await fetch("/api/admin/legal", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to upload privacy.pdf:", text);
        setStatusPrivacy("Error uploading privacy.pdf. Please try again.");
        return;
      }

      setStatusPrivacy("privacy.pdf uploaded successfully.");
    } catch (err) {
      console.error("Unexpected error uploading privacy.pdf", err);
      setStatusPrivacy("Unexpected error. Please try again.");
    } finally {
      setIsSavingPrivacy(false);
    }
  }

  return (
    <div className="page">
      <header className="header">
        <h1 className="site-title">MalatestaArt</h1>
      </header>

      <main className="main">
        <section className="text-section">
          <h2 className="section-title">Edit Legal PDFs</h2>
          <p className="section-text">
            Upload new versions of <code>terms.pdf</code> and <code>privacy.pdf</code>. The files must
            use these exact names and will overwrite the existing ones in your R2 bucket under{" "}
            <code>admin/terms.pdf</code> and <code>admin/privacy.pdf</code>.
          </p>

          <div className="admin-panels">
            <div className="admin-panel">
              <h3 className="admin-panel-title">Upload terms.pdf</h3>
              <form onSubmit={handleTermsSubmit} className="admin-form">
                <p className="section-text">
                  Mandatory file name: <code>terms.pdf</code>
                </p>
                <input
                  id="termsFile"
                  name="termsFile"
                  type="file"
                  accept="application/pdf"
                  className="file-input"
                  onChange={handleTermsChange}
                />
                <button type="submit" className="buy-button" disabled={isSavingTerms}>
                  {isSavingTerms ? "Uploading..." : "Upload terms.pdf"}
                </button>
                {statusTerms && <p className="status-text">{statusTerms}</p>}
              </form>
            </div>

            <div className="admin-panel">
              <h3 className="admin-panel-title">Upload privacy.pdf</h3>
              <form onSubmit={handlePrivacySubmit} className="admin-form">
                <p className="section-text">
                  Mandatory file name: <code>privacy.pdf</code>
                </p>
                <input
                  id="privacyFile"
                  name="privacyFile"
                  type="file"
                  accept="application/pdf"
                  className="file-input"
                  onChange={handlePrivacyChange}
                />
                <button type="submit" className="buy-button" disabled={isSavingPrivacy}>
                  {isSavingPrivacy ? "Uploading..." : "Upload privacy.pdf"}
                </button>
                {statusPrivacy && <p className="status-text">{statusPrivacy}</p>}
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
