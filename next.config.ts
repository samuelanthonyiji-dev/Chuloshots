import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML/CSS/JS export, served by Vercel like the original site
  output: "export",
  // Pages export as folders (/work/index.html) so /work/ works on any static host
  trailingSlash: true,
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
