import type { Metadata } from "next";
import HomeClient from "./HomeClient";

const SITE_URL =
process.env.NEXT_PUBLIC_SITE_URL || "https://enricomalatesta-art.pages.dev";

export const metadata: Metadata = {
  title: "MalatestaArt | Paintings & Digital Art by Enrico Malatesta",
  description:
  "Explore MalatestaArt, the online showcase of Enrico Malatesta’s paintings and digital artworks, combining psychedelic color, geometric structure and intuitive gesture.",
  openGraph: {
    title: "MalatestaArt | Paintings & Digital Art by Enrico Malatesta",
    description:
    "Discover original paintings and digital works by Enrico Malatesta. A curated selection of abstract, geometric and psychedelic-inspired artworks.",
    url: SITE_URL,
    siteName: "MalatestaArt",
    images: [
      {
        url: `${SITE_URL}/api/artwork/image?key=admin/about-bio.webp`,
        width: 1200,
        height: 630,
        alt: "Artwork and portrait of Enrico Malatesta",
      },
    ],
    type: "website",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function Page() {
  return <HomeClient />;
}
