import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "imagedelivery.net",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/@:handle",
        destination: "/channel/:handle",
      },
    ];
  },
};

export default nextConfig;
