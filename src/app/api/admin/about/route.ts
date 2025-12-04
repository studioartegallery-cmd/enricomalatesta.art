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

type AboutContent = {
  aboutText: string;
  instagram?: string;
  facebook?: string;
  x?: string;
  website?: string;
  email?: string;
};

const ABOUT_IMAGE_KEY = "admin/about-bio.webp";
const ABOUT_JSON_KEY = "admin/about.json";

function getBucket(): R2Bucket {
  const env = getRequestContext().env as Env;
  const bucket = env.ARTWORKS;
  if (!bucket) {
    throw new Error("R2 bucket binding ARTWORKS is missing");
  }
  return bucket;
}

function sanitizeAboutContent(input: any): AboutContent {
  const aboutText = typeof input.aboutText === "string" ? input.aboutText : "";

  const instagram =
    typeof input.instagram === "string" && input.instagram.trim().length > 0
      ? input.instagram
      : "";

  const facebook =
    typeof input.facebook === "string" && input.facebook.trim().length > 0
      ? input.facebook
      : "";

  const x =
    typeof input.x === "string" && input.x.trim().length > 0 ? input.x : "";

  const website =
    typeof input.website === "string" && input.website.trim().length > 0
      ? input.website
      : "";

  const email =
    typeof input.email === "string" && input.email.trim().length > 0
      ? input.email
      : "";

  return {
    aboutText,
    instagram,
    facebook,
    x,
    website,
    email,
  };
}

export async function GET() {
  try {
    const bucket = getBucket();

    if (!bucket.get) {
      return new Response(
        JSON.stringify({
          aboutText: "",
          instagram: "",
          facebook: "",
          x: "",
          website: "",
          email: "",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const obj = await bucket.get(ABOUT_JSON_KEY);

    if (!obj) {
      return new Response(
        JSON.stringify({
          aboutText: "",
          instagram: "",
          facebook: "",
          x: "",
          website: "",
          email: "",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const text = await new Response(obj.body).text();
    let parsed: any;

    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {};
    }

    const safe = sanitizeAboutContent(parsed);

    return new Response(JSON.stringify(safe), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("Error in GET /api/admin/about", err);
    return new Response("Internal error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const bucket = getBucket();
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      // Save About text + socials as JSON in R2.
      const raw = await request.json();
      const settings = sanitizeAboutContent(raw);

      await bucket.put(ABOUT_JSON_KEY, JSON.stringify(settings, null, 2), {
        httpMetadata: {
          contentType: "application/json",
        },
        customMetadata: {
          kind: "about-content",
        },
      });

      return new Response(JSON.stringify(settings), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Fallback: treat as image upload (multipart/form-data).
    const formData = await request.formData();

    const file =
      (formData.get("aboutImage") as File | null) ||
      (formData.get("file") as File | null) ||
      (formData.get("image") as File | null);

    if (!file) {
      return new Response("No file uploaded", { status: 400 });
    }

    const contentTypeHeader = file.type || "image/webp";

    // In the edge runtime, File is a Blob, so we can stream it directly.
    const body = (file as any).stream
      ? (file as any).stream()
      : await file.arrayBuffer();

    await bucket.put(ABOUT_IMAGE_KEY, body as any, {
      httpMetadata: {
        contentType: contentTypeHeader,
      },
      customMetadata: {
        originalName: file.name || "",
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        key: ABOUT_IMAGE_KEY,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("R2 about image/content upload error", err);
    return new Response("Internal error", { status: 500 });
  }
}
