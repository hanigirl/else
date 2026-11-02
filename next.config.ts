import type { NextConfig } from "next";

/** The site lives at weareelse.co.il/learnuiux. Change here and everything follows. */
const BASE_PATH = "/learnuiux";

/**
 * Framer origin for proxying uxtra.co.il pages.
 * TODO: Set FRAMER_ORIGIN in environment to the actual Framer default domain
 * (*.framer.website or *.framer.app) for project 4TjPrHpPozuW6EgtpfQaKY.
 * This cannot point to uxtra.co.il (would create a redirect loop after DNS switch).
 */
const FRAMER_ORIGIN = process.env.FRAMER_ORIGIN || "https://FRAMER-ORIGIN-NOT-SET.example";

/**
 * Design-to-code workshop site origin.
 * TODO: Set DESIGN_TO_CODE_ORIGIN in environment to the actual Vercel deployment URL
 * for the design-to-code Next.js app (likely hanigirl/design-to-code-site or
 * danielboaron23/design-to-code-site).
 */
const DESIGN_TO_CODE_ORIGIN = process.env.DESIGN_TO_CODE_ORIGIN || "";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  basePath: BASE_PATH,
  env: { NEXT_PUBLIC_BASE_PATH: BASE_PATH },
  async rewrites() {
    const rewrites: Array<{ source: string; destination: string }> = [
      // the else deck / offer page is a static HTML file in public/offer
      { source: "/offer", destination: "/offer/index.html" },
    ];

    // Proxy Framer pages from uxtra.co.il (now on Framer) to weareelse.co.il
    // These must proxy to the Framer project's default domain, NOT uxtra.co.il
    // (after DNS switch, uxtra.co.il will 301 redirect here → loop prevention)
    if (FRAMER_ORIGIN && FRAMER_ORIGIN !== "https://FRAMER-ORIGIN-NOT-SET.example") {
      const framerPaths = [
        "/courses/figma-flow",
        "/courses/figma-flow/thank-you",
        "/courses/figma-flow/approved-for-updates",
        "/courses/figma-flow-offer",
        "/courses/figma-flow-offer/thank-you",
        "/courses/figma-flow-offer/approved-for-updates",
        "/figma-canvas",
        "/figma-canvas/figma-flow-discount",
        "/comin",
        "/thank-you",
        "/quiz/quiz-1",
        "/terms-and-conditions",
        "/privacy",
      ];

      framerPaths.forEach((path) => {
        rewrites.push({
          source: path,
          destination: `${FRAMER_ORIGIN}${path}`,
        });
      });

      // Proxy Framer assets (CSS, JS, images, fonts, etc.)
      // Framer typically serves assets from /_next/static/, /assets/, or root-level paths
      rewrites.push(
        {
          source: "/_framer/:path*",
          destination: `${FRAMER_ORIGIN}/_framer/:path*`,
        },
        {
          source: "/framerusercontent.com/:path*",
          destination: `https://framerusercontent.com/:path*`,
        }
      );
    }

    // Proxy design-to-code workshop site
    if (DESIGN_TO_CODE_ORIGIN) {
      rewrites.push({
        source: "/workshops/design-to-code/:path*",
        destination: `${DESIGN_TO_CODE_ORIGIN}/workshops/design-to-code/:path*`,
      });
    }

    return rewrites;
  },
  async redirects() {
    // the bare domain forwards to the course page (until weareelse.co.il has a home of its own)
    return [{ source: "/", destination: BASE_PATH, basePath: false, permanent: false }];
  },
};

export default nextConfig;
