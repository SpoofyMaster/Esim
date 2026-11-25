import type { NextConfig } from "next";
const config: NextConfig = {
  transpilePackages: ["@bleusim/geospatial", "@bleusim/catalog", "@bleusim/design-tokens", "@bleusim/api-client"],
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/earth/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] }];
  },
};
export default config;
