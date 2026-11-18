import type { NextConfig } from "next";
import { legacyRedirects } from "./legacy-redirects";

const nextConfig: NextConfig = {
  // Old purobodysoul.com (Wix) addresses → their new pages.
  async redirects() {
    return legacyRedirects();
  },
};

export default nextConfig;
