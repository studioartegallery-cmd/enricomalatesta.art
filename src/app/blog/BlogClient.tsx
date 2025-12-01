import type { Metadata } from "next";
import BlogClient from "./BlogClient";

const SITE_URL =
process.env.NEXT_PUBLIC_SITE_URL || "https://enricomalatesta-art.pages.dev";

export const metadata: Metadata = {
    title: "Blog | MalatestaArt – Stories & Art Updates",
    description:
    "Read the MalatestaArt blog for short notes, background stories and updates on new paintings and digital artworks by Enrico Malatesta.",
    openGraph: {
        title: "Blog | MalatestaArt – Stories & Art Updates",
        description:
        "Discover insights behind Enrico Malatesta’s artworks, from new series to experiments in color, geometry and digital composition.",
        url: `${SITE_URL}/blog`,
        siteName: "MalatestaArt",
        images: [
            {
                url: `${SITE_URL}/api/artwork/image?key=admin/about-bio.webp`,
                width: 1200,
                height: 630,
                alt: "MalatestaArt blog – artworks and details",
            },
        ],
        type: "website",
    },
    alternates: {
        canonical: `${SITE_URL}/blog`,
    },
};

export default function Page() {
    return <BlogClient />;
}
