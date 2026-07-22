import type { MetadataRoute } from "next";

// Metadata routes must be explicitly static when Next.js exports the site for
// Cloudflare Pages.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
