import type { NextConfig } from "next";

// The site currently needs no framework-specific overrides. Next.js 16 no
// longer runs lint as part of `next build`, so the former `eslint` escape hatch
// is intentionally gone.
// STATIC_EXPORT=1 flips on `output: "export"` for the Vercel static deploy
// (every page is SSG; unoptimized images are required in export mode). The
// default (server) build is unchanged.
const nextConfig: NextConfig = process.env.STATIC_EXPORT
  ? { output: "export", images: { unoptimized: true } }
  : {};

export default nextConfig;
