import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

type Env = {
  ARTWORKS?: R2Bucket;
};

type R2Bucket = {
  put: (
    key: string,
    value: ArrayBuffer | Uint8Array | ReadableStream,
    options?: {
      httpMetadata?: {
        contentType?: string;
      };
      customMetadata?: Record<string, string>;
    }
  ) => Promise<unknown>;
};

function slugify(input: string): string {
  const base = input.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return base || "artwork";
}

export async function POST(request: Request): Promise<Response> {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return new Response("Missing file", { status: 400 });
    }

    const artist = (form.get("artist") as string) || "";
    const title = (form.get("title") as string) || "";
    const style = (form.get("style") as string) || "";
    const technique = (form.get("technique") as string) || "";
    const widthCm = (form.get("widthCm") as string) || "";
    const heightCm = (form.get("heightCm") as string) || "";
    const price = (form.get("price") as string) || "";

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

  const { env } = getRequestContext() as { env: Env };
    const bucket = env.ARTWORKS;
    if (!bucket) {
      return new Response("R2 bucket binding ARTWORKS is not configured", { status: 500 });
    }

    const now = new Date();
    const datePrefix = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(
      now.getDate()
    ).padStart(2, "0")}`;
    const safeTitle = slugify(title || "untitled");
    const key = `artworks/${datePrefix}/${Date.now()}-${safeTitle}.webp`;

    await bucket.put(key, bytes, {
      httpMetadata: {
        contentType: file.type || "image/webp",
      },
      customMetadata: {
        artist,
        title,
        style,
        technique,
        widthCm,
        heightCm,
        price,
      },
    });

    const base = (process.env.NEXT_PUBLIC_R2_BASE || "").replace(/\/+$/, "");
    const publicUrl = base ? `${base}/${key}` : "";

    return new Response(JSON.stringify({ key, publicUrl }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("R2 upload error", err);
    return new Response("Internal error", { status: 500 });
  }
}
