/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@promptforge/core",
    "@promptforge/ui",
    "@promptforge/convex",
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
