import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

type R2HttpMetadata = {
  contentType?: string;
};

type R2ObjectBody = {
  body: ReadableStream;
  httpMetadata?: R2HttpMetadata;
  customMetadata?: Record<string, string>;
};

type R2Bucket = {
  get?: (key: string) => Promise<R2ObjectBody | null>;
  put?: (
    key: string,
    value: ReadableStream | ArrayBuffer | string | Blob,
    options?: { httpMetadata?: R2HttpMetadata; customMetadata?: Record<string, string> }
  ) => Promise<void>;
  delete?: (key: string) => Promise<void>;
};

type D1Database = {
  prepare(query: string): D1PreparedStatement;
};

type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<D1Result>;
  all<T = unknown>(): Promise<{ results: T[] | null }>;
  first<T = unknown>(): Promise<T | null>;
};

type D1Result = {
  success: boolean;
  lastRowId?: number;
  changes?: number;
  error?: unknown;
};

function getDbAndBucket(): { db: D1Database; bucket: R2Bucket | null } {
  const { env } = getRequestContext();
  const db = (env as any).DB as D1Database | undefined;
  const bucket = ((env as any).ARTWORKS as R2Bucket | undefined) ?? null;

  if (!db) {
    throw new Error("DB binding not configured for blog");
  }

  return { db, bucket };
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .trim();
}

export async function GET() {
  try {
    const { db } = getDbAndBucket();

    const result = await db
      .prepare(
        "SELECT id, slug, title, excerpt, imageKey, createdAt, published FROM blog_posts ORDER BY datetime(createdAt) DESC"
      )
      .all<{
        id: number;
        slug: string;
        title: string;
        excerpt: string;
        imageKey: string | null;
        createdAt: string;
        published: number;
      }>();

    const posts = result.results ?? [];

    return new Response(JSON.stringify(posts), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("Error listing blog posts", err);
    return new Response("Internal error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { db, bucket } = getDbAndBucket();

    const formData = await request.formData();

    const title = String(formData.get("title") || "").trim();
    const excerpt = String(formData.get("excerpt") || "").trim();
    const body = (String(formData.get("body") || "").trim() || null) as string | null;
    const published = formData.get("published") === "on" || formData.get("published") === "true";

    if (!title || !excerpt) {
      return new Response("Missing required fields", { status: 400 });
    }

    let slug = slugify(title);
    if (!slug) {
      slug = `post-${Date.now()}`;
    }

    let imageKey: string | null = null;

    const maybeFile = formData.get("image");
    if (maybeFile && maybeFile instanceof File && bucket && bucket.put) {
      const file = maybeFile as File;
      const originalName = file.name || "blog-image.webp";
      const extMatch = originalName.match(/\.([a-zA-Z0-9]+)$/);
      const ext = extMatch ? extMatch[1].toLowerCase() : "webp";
      const key = `blog/${slug}.${ext}`;
      const arrayBuffer = await file.arrayBuffer();

      await bucket.put(key, arrayBuffer, {
        httpMetadata: {
          contentType: file.type || "image/webp",
        },
      });

      imageKey = key;
    }

    const now = new Date().toISOString();

    const result = await db
      .prepare(
        "INSERT INTO blog_posts (slug, title, excerpt, body, imageKey, createdAt, updatedAt, published) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)"
      )
      .bind(slug, title, excerpt, body, imageKey, now, now, published ? 1 : 0)
      .run();

    const id = result.lastRowId ?? 0;

    return new Response(
      JSON.stringify({
        id,
        slug,
        title,
        excerpt,
        imageKey,
        createdAt: now,
        published: published ? 1 : 0,
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("Error creating blog post", err);
    return new Response("Internal error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { db, bucket } = getDbAndBucket();

    const url = new URL(request.url);
    const idParam = url.searchParams.get("id");

    if (!idParam) {
      return new Response("Missing id", { status: 400 });
    }

    const id = Number(idParam);
    if (!Number.isFinite(id)) {
      return new Response("Invalid id", { status: 400 });
    }

    let imageKey: string | null = null;
    const existing = await db
      .prepare("SELECT imageKey FROM blog_posts WHERE id = ?1")
      .bind(id)
      .first<{ imageKey: string | null }>();

    if (existing && typeof existing.imageKey === "string") {
      imageKey = existing.imageKey;
    }

    await db.prepare("DELETE FROM blog_posts WHERE id = ?1").bind(id).run();

    if (imageKey && bucket && bucket.delete) {
      try {
        await bucket.delete(imageKey);
      } catch (err) {
        console.warn("Failed to delete blog image from R2", err);
      }
    }

    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("Error deleting blog post", err);
    return new Response("Internal error", { status: 500 });
  }
}
