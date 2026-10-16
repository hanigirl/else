import type { NextConfig } from "next";

/** The site lives at weareelse.co.il/learnuiux. Change here and everything follows. */
const BASE_PATH = "/learnuiux";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  basePath: BASE_PATH,
  env: { NEXT_PUBLIC_BASE_PATH: BASE_PATH },
  async rewrites() {
    // the else deck / offer page is a static HTML file in public/offer
    return [{ source: "/offer", destination: "/offer/index.html" }];
  },
  async redirects() {
    // the bare domain forwards to the course page (until weareelse.co.il has a home of its own)
    return [{ source: "/", destination: BASE_PATH, basePath: false, permanent: false }];
  },
};

export default nextConfig;
