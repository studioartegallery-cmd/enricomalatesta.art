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
    const url = new URL(request.url);
    const key = url.searchParams.get("key");

    if (!key) {
      return new Response("Missing key", { status: 400 });
    }

    const { env } = getRequestContext() as { env: Env };
    const bucket = env.ARTWORKS;
    if (!bucket) {
      return new Response("ARTWORKS bucket not configured", { status: 500 });
    }

    const object = await bucket.get(key);
    if (!object) {
      return new Response("Not found", { status: 404 });
    }

    const contentType = object.httpMetadata?.contentType || "image/webp";

    return new Response(object.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("R2 image proxy error", err);
    return new Response("Internal error", { status: 500 });
  }
}
