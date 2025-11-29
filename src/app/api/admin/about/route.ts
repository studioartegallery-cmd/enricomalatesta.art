import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

type Env = {
  ARTWORKS?: R2Bucket;
};

type R2Bucket = {
  get?: (key: string) => Promise<R2GetObject | null>;
  put: (
    key: string,
    value: ReadableStream | ArrayBuffer | string | Blob,
    options?: { httpMetadata?: R2HttpMetadata; customMetadata?: Record<string, string> }
  ) => Promise<void>;
  delete?: (key: string) => Promise<void>;
  list?: (options?: { prefix?: string }) => Promise<R2ListResult>;
};

type R2HttpMetadata = {
  contentType?: string;
};

type R2GetObject = {
  body: ReadableStream;
  httpMetadata?: R2HttpMetadata | null;
};

type R2Object = {
  key: string;
  customMetadata?: Record<string, string>;
};

type R2ListResult = {
  objects: R2Object[];
};

export async function POST(request: Request) {
  try {
    const env = getRequestContext().env as Env;
    const bucket = env.ARTWORKS;

    if (!bucket) {
      console.error("R2 bucket binding ARTWORKS is missing");
      return new Response("R2 bucket not configured", { status: 500 });
    }

    const formData = await request.formData();

    const file =
      (formData.get("aboutImage") as File | null) ||
      (formData.get("file") as File | null) ||
      (formData.get("image") as File | null);

    if (!file) {
      return new Response("No file uploaded", { status: 400 });
    }

    const key = "admin/about-bio.webp";
    const contentType = file.type || "image/webp";

    // In the edge runtime, File is a Blob, so we can stream it directly.
    const body = file.stream ? file.stream() : await file.arrayBuffer();

    await bucket.put(key, body as any, {
      httpMetadata: {
        contentType,
      },
      customMetadata: {
        originalName: file.name || "",
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        key,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("R2 about image upload error", err);
    return new Response("Internal error", { status: 500 });
  }
}
