import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/N3evin/AmiiboAPI/**",
      },
    ],
  },
};

export default nextConfig;
