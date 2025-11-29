import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

type Env = {
  ARTWORKS?: R2Bucket;
};

type R2Bucket = {
  get: (key: string) => Promise<R2Object | null>;
};

type R2HttpMetadata = {
  contentType?: string;
};

type R2Object = {
  body: ReadableStream;
  httpMetadata?: R2HttpMetadata | null;
};

export async function GET(request: Request) {
  try {
    const env = getRequestContext().env as Env;
    const bucket = env.ARTWORKS;

    if (!bucket) {
      console.error("R2 bucket binding ARTWORKS is missing");
      return new Response("R2 bucket not configured", { status: 500 });
    }

    const url = new URL(request.url);
    const key = url.searchParams.get("key");

    if (!key) {
      return new Response("Missing key", { status: 400 });
    }

    const object = await bucket.get(key);

    if (!object) {
      return new Response("Not found", { status: 404 });
    }

    const contentType = object.httpMetadata?.contentType || "image/webp";

    // For admin assets (like the About bio), we disable caching so updates appear immediately.
    // For artwork images, we keep a long cache.
    let cacheControl = "public, max-age=31536000, immutable";
    if (key.startsWith("admin/")) {
      cacheControl = "no-store";
    }

    return new Response(object.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": cacheControl,
      },
    });
  } catch (err) {
    console.error("R2 image proxy error", err);
    return new Response("Internal error", { status: 500 });
  }
}