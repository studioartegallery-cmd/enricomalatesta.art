import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

type Env = {
  ARTWORKS?: R2Bucket;
};

type R2Object = {
  key: string;
  customMetadata?: Record<string, string>;
};

type R2ListResult = {
  objects: R2Object[];
};

type R2Bucket = {
  list: (options?: { prefix?: string; limit?: number; cursor?: string }) => Promise<R2ListResult>;
  put: (
    key: string,
    value: ArrayBuffer | Uint8Array | ReadableStream,
    options?: {
      httpMetadata?: {
        contentType?: string;
      };
      customMetadata?: Record<string, string>;
    }
  ) => Promise<void>;
};

type Filter = "all" | "paintings" | "digital";

type Artwork = {
  id: string;
  title: string;
  subtitle: string;
  type: Filter;
  price: string;
  imageUrl: string;
};

function slugify(input: string): string {
  const base = input.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return base || "artwork";
}

function titleFromKey(key: string): string {
  const parts = key.split("/");
  const file = parts[parts.length - 1] || "";
  const noExt = file.replace(/\.webp$/i, "");
  const noPrefix = noExt.replace(/^\d+-/, "");
  const spaced = noPrefix.replace(/-/g, " ").replace(/\s+/g, " ").trim();
  if (!spaced) return "UNTITLED";
  return spaced.toUpperCase();
}

export async function GET() {
  try {
    const { env } = getRequestContext() as { env: Env };
    const bucket = env.ARTWORKS;
    if (!bucket) {
      return new Response("ARTWORKS bucket not configured", { status: 500 });
    }

    const list = await bucket.list({ prefix: "artworks/" });

    const items: Artwork[] = list.objects.map((obj) => {
      const meta = obj.customMetadata || {};

      const style = meta.style || "";
      const technique = meta.technique || "";
      const width = meta.widthCm || "";
      const height = meta.heightCm || "";
      const price = meta.price || "";

      const fallbackFromKey = titleFromKey(obj.key);
      const title =
        (meta.title && meta.title.trim()) ||
        (style && style.trim()) ||
        fallbackFromKey;

      const subtitleParts: string[] = [];
      if (style) subtitleParts.push(style);
      if (technique) subtitleParts.push(technique);
      if (width && height) subtitleParts.push(`${width} × ${height} cm`);
      const subtitle = subtitleParts.join(" · ");

      let type: Filter = "paintings";
      const kind = `${style} ${technique}`.toLowerCase();
      if (kind.includes("digital")) {
        type = "digital";
      }

      return {
        id: obj.key,
        title,
        subtitle,
        type,
        price: price || "",
        imageUrl: `/api/artwork/image?key=${encodeURIComponent(obj.key)}`,
      };
    });

    items.sort((a, b) => (a.id < b.id ? 1 : -1));

    return new Response(JSON.stringify(items), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("Error listing artworks from R2", err);
    return new Response("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return new Response("Missing file", { status: 400 });
    }

    const artist = (formData.get("artist") ?? "").toString();
    const title = (formData.get("title") ?? "").toString();
    const style = (formData.get("style") ?? "").toString();
    const technique = (formData.get("technique") ?? "").toString();
    const widthCm = (formData.get("widthCm") ?? "").toString();
    const heightCm = (formData.get("heightCm") ?? "").toString();
    const price = (formData.get("price") ?? "").toString();

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
    const safeTitle = slugify(title || style || "untitled");
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

    const publicUrl = `/api/artwork/image?key=${encodeURIComponent(key)}`;

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
