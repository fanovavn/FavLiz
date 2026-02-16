import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        {
          source: "/:username/:slug",
          destination: "/u/:username/:slug",
        },
      ],
    };
  },
};

export default nextConfig;
