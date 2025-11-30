import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

type D1Database = {
  prepare(query: string): D1PreparedStatement;
};

type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T = unknown>(): Promise<{ results: T[] | null }>;
  first<T = unknown>(): Promise<T | null>;
};

type Env = {
  DB?: D1Database;
};

type BlogPostRow = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string | null;
  imageKey: string | null;
  createdAt: string;
  published: number;
};

export async function GET(request: Request) {
  try {
    const { env } = getRequestContext<Env>();
    const db = (env as any).DB as D1Database | undefined;

    if (!db) {
      console.error("DB binding not configured for blog");
      return new Response("DB not configured", { status: 500 });
    }

    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");

    // Single post by slug
    if (slug) {
      const stmt = db
      .prepare(
        "SELECT id, slug, title, excerpt, body, imageKey, createdAt, published FROM blog_posts WHERE slug = ?1 AND published = 1"
      )
      .bind(slug);

      const row = (await stmt.first()) as BlogPostRow | null;

      if (!row) {
        return new Response("Not found", { status: 404 });
      }

      return new Response(JSON.stringify(row), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // List of published posts
    const stmt = db.prepare(
      "SELECT id, slug, title, excerpt, imageKey, createdAt, published FROM blog_posts WHERE published = 1 ORDER BY datetime(createdAt) DESC"
    );

    const result = await stmt.all();
    const posts = (result.results ?? []) as BlogPostRow[];

    return new Response(JSON.stringify(posts), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("Error loading blog posts", err);
    return new Response("Internal error", { status: 500 });
  }
}
