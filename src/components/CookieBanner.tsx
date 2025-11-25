"use client";

import { useEffect, useState } from "react";

const COOKIE_NAME = "emart_cookie_consent";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    const lastPart = parts.pop();
    if (!lastPart) return null;
    const result = lastPart.split(";").shift();
    return result ?? null;
  }

  return null;
}

function setCookie(name: string, value: string, days: number = 365): void {
  if (typeof document === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/`;
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = getCookie(COOKIE_NAME);
    if (!existing) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const handleChoice = (value: "accepted" | "declined") => {
    setCookie(COOKIE_NAME, value);
    setVisible(false);
  };

  const linkStyle = {
    color: "#fbbf24",
    textDecoration: "underline",
  } as const;

  const buttonBase = {
    borderRadius: 999,
    fontSize: "12px",
    padding: "6px 12px",
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.3)",
    background: "transparent",
    color: "#f9fafb",
  } as const;

  const acceptStyle = {
    ...buttonBase,
    border: "none",
    background: "#fbbf24",
    color: "#000",
    fontWeight: 600,
  } as const;

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        display: "flex",
        justifyContent: "center",
        padding: "0 16px 16px",
      }}
    >
      <div
        style={{
          background: "rgba(0,0,0,0.8)",
          color: "#f9fafb",
          fontSize: "14px",
          padding: "12px 16px",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.1)",
          maxWidth: 720,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <p style={{ lineHeight: 1.4 }}>
          This site uses minimal cookies. See{" "}
          <a href="/api/download/terms" style={linkStyle}>
            Terms
          </a>{" "}
          and{" "}
          <a href="/api/download/privacy" style={linkStyle}>
            Privacy
          </a>
          .
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button
            type="button"
            onClick={() => handleChoice("declined")}
            style={buttonBase}
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => handleChoice("accepted")}
            style={acceptStyle}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
