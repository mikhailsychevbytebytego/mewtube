import type { NextConfig } from "next";

const onnxRuntime = "./node_modules/onnxruntime-node/bin/napi-v3/linux/x64/**/*";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@xenova/transformers", "onnxruntime-node", "sharp"],
  outputFileTracingIncludes: {
    "/": [onnxRuntime],
    "/*": [onnxRuntime],
    "/**/*": [onnxRuntime],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "imagedelivery.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.cloudflarestream.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "videodelivery.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.videodelivery.net",
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
