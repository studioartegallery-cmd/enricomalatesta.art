import type { MetadataRoute } from "next";

export const runtime = "edge";

function getBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "https://enricomalatesta.art";
  // If dev URL is set, fall back to the production domain for SEO assets.
  if (raw.includes("localhost") || raw.includes("127.0.0.1")) return "https://enricomalatesta.art";
  return raw.replace(/\/$/, "");
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
