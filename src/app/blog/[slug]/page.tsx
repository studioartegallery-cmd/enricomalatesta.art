import type { Metadata } from "next";
import BlogDetailClient from "./BlogDetailClient";

export const runtime = "edge";

const SITE_URL =
process.env.NEXT_PUBLIC_SITE_URL || "https://enricomalatesta-art.pages.dev";

type BlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string | null;
  imageKey: string | null;
  createdAt: string;
  published: number;
};

async function fetchPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(
      `${SITE_URL}/api/blog?slug=${encodeURIComponent(slug)}`,
                            { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as BlogPost;
    return data;
  } catch (e) {
    console.error("generateMetadata blog slug fetch error:", e);
    return null;
  }
}

export async function generateMetadata(props: any): Promise<Metadata> {
  const slug = (props?.params?.slug as string) || "";
  if (!slug) {
    return {
      title: "Blog Post | MalatestaArt",
      description:
      "Read a blog post from MalatestaArt, sharing thoughts and stories around paintings and digital artworks by Enrico Malatesta.",
    };
  }

  const post = await fetchPost(slug);

  if (!post) {
    // Fallback metadata if post not found
    return {
      title: "Blog Post | MalatestaArt",
      description:
      "A story from the MalatestaArt blog exploring art, process and experimentation.",
      alternates: {
        canonical: `${SITE_URL}/blog/${slug}`,
      },
      openGraph: {
        title: "Blog Post | MalatestaArt",
        description:
        "A story from the MalatestaArt blog exploring art, process and experimentation.",
        url: `${SITE_URL}/blog/${slug}`,
        siteName: "MalatestaArt",
        type: "article",
      },
    };
  }

  const imageUrl = post.imageKey
  ? `${SITE_URL}/api/artwork/image?key=${encodeURIComponent(post.imageKey)}`
  : `${SITE_URL}/api/artwork/image?key=admin/about-bio.webp`;

  return {
    title: `${post.title} | MalatestaArt Blog`,
    description: post.excerpt,
    alternates: {
      canonical: `${SITE_URL}/blog/${post.slug}`,
    },
    openGraph: {
      title: `${post.title} | MalatestaArt Blog`,
      description: post.excerpt,
      url: `${SITE_URL}/blog/${post.slug}`,
      siteName: "MalatestaArt",
      type: "article",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}

export default function Page(props: any) {
  const slug = (props?.params?.slug as string) || "";
  return <BlogDetailClient slug={slug} />;
}
