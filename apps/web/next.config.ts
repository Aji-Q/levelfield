import type { NextConfig } from "next";

// No API routes, no image optimization needs (no remote images), no ESLint
// project set up for this app yet — skip the lint pass so `next build` doesn't
// try to interactively bootstrap one.
const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
