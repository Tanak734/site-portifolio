import type { NextConfig } from "next";

// GITHUB_PAGES=true → export estático para o GitHub Pages (servido em /site-portifolio).
// Sem a variável, o app roda normal (dev / servidor Node com admin e Server Actions).
const pages = process.env.GITHUB_PAGES === "true";
const basePath = pages ? "/site-portifolio" : "";

const nextConfig: NextConfig = {
  /* config options here */
  // Cache Components/PPR não funcionam com output: 'export' (ver scripts/pages-prepare.mjs).
  cacheComponents: !pages,
  partialPrefetching: !pages,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  ...(pages && {
    output: "export",
    basePath,
    trailingSlash: true,
    images: { unoptimized: true },
  }),
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
