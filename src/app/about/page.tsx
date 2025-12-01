import type { Metadata } from "next";
import AboutClient from "./AboutClient";

const SITE_URL =
process.env.NEXT_PUBLIC_SITE_URL || "https://enricomalatesta-art.pages.dev";

export const metadata: Metadata = {
  title: "About | Enrico Malatesta – MalatestaArt",
  description:
  "Learn about Enrico Malatesta, the visual and digital artist behind MalatestaArt, whose work blends psychedelic color, geometric structure and intuitive gesture.",
  openGraph: {
    title: "About Enrico Malatesta – MalatestaArt",
    description:
    "Biography and artistic statement of Enrico Malatesta, featuring his journey from psychedelic influences to contemporary abstract and digital art.",
    url: `${SITE_URL}/about`,
    siteName: "MalatestaArt",
    images: [
      {
        url: `${SITE_URL}/api/artwork/image?key=admin/about-bio.webp`,
        width: 1200,
        height: 630,
        alt: "Portrait and artwork of Enrico Malatesta",
      },
    ],
    type: "website",
  },
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
};

export default function Page() {
  return <AboutClient />;
}
