import type { NextConfig } from "next";

const isCloudflarePages =
  process.env.CF_PAGES === "1" ||
  process.env.BUILD_TARGET === "cloudflare-pages";

const nextConfig: NextConfig = {
  ...(isCloudflarePages
    ? {
        output: "export" as const,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
