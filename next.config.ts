import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  outputFileTracingIncludes: { "/api/projects/media": ["./public/projects/**/*"] },
  async headers() { return [{ source:"/:path*", headers:[{ key:"X-Content-Type-Options", value:"nosniff" }, { key:"Referrer-Policy", value:"strict-origin-when-cross-origin" }, { key:"X-Frame-Options", value:"DENY" }, { key:"Permissions-Policy", value:"camera=(), microphone=(), geolocation=()" }] }]; },
  cacheComponents: true,
  images: { formats: ["image/avif", "image/webp"], qualities: [90], imageSizes: [32, 48, 64, 96, 128, 192, 256, 384, 512] },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
