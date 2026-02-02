import type { MetadataRoute } from "next";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

type D1Database = {
  prepare(query: string): D1PreparedStatement;
};

type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T = unknown>(): Promise<{ results: T[] | null }>;
};

type Env = {
  DB?: D1Database;
};

type BlogSitemapRow = {
  slug: string;
  updatedAt?: string | null;
  createdAt?: string | null;
};

function getBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "https://enricomalatesta.art";
  if (raw.includes("localhost") || raw.includes("127.0.0.1")) return "https://enricomalatesta.art";
  return raw.replace(/\/$/, "");
}

function toDate(value?: string | null): Date | undefined {
  if (!value) return undefined;
  // D1 datetime('now') -> "YYYY-MM-DD HH:MM:SS"
  const isoish = value.includes("T") ? value : value.replace(" ", "T") + "Z";
  const d = new Date(isoish);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  try {
    const { env } = getRequestContext<Env>();
    const db = (env as any).DB as D1Database | undefined;

    if (!db) return staticEntries;

    const { results } = await db
      .prepare(
        "SELECT slug, updatedAt, createdAt FROM blog_posts WHERE published = 1 ORDER BY createdAt DESC"
      )
      .all<BlogSitemapRow>();

    const posts = (results || [])
      .filter((r) => r && typeof r.slug === "string" && r.slug.length > 0)
      .map((r) => {
        const lastModified = toDate(r.updatedAt || r.createdAt);
        return {
          url: `${baseUrl}/blog/${encodeURIComponent(r.slug)}`,
          lastModified,
          changeFrequency: "monthly" as const,
          priority: 0.5,
        };
      });

    return [...staticEntries, ...posts];
  } catch {
    return staticEntries;
  }
}
