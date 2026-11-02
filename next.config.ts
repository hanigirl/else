import type { NextConfig } from "next";

/** The site lives at weareelse.co.il/learnuiux. Change here and everything follows. */
const BASE_PATH = "/learnuiux";

/**
 * Framer origin for proxying uxtra.co.il pages.
 * Default: https://adored-look-881750.framer.app (Framer project 4TjPrHpPozuW6EgtpfQaKY)
 * This cannot point to uxtra.co.il (would create a redirect loop after DNS switch).
 * Override via FRAMER_ORIGIN environment variable if needed.
 */
const FRAMER_ORIGIN = process.env.FRAMER_ORIGIN || "https://adored-look-881750.framer.app";

/**
 * Design-to-code workshop site origin.
 * Default: https://design-to-code-site-two.vercel.app
 * Override via DESIGN_TO_CODE_ORIGIN environment variable if needed.
 */
const DESIGN_TO_CODE_ORIGIN = process.env.DESIGN_TO_CODE_ORIGIN || "https://design-to-code-site-two.vercel.app";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  basePath: BASE_PATH,
  env: { NEXT_PUBLIC_BASE_PATH: BASE_PATH },
  async rewrites() {
    // Internal rewrites (within basePath /learnuiux)
    const internalRewrites = [
      // the else deck / offer page is a static HTML file in public/offer
      { source: "/offer", destination: "/offer/index.html" },
    ];

    // External rewrites (at domain root, bypassing basePath)
    const externalRewrites: Array<{ source: string; destination: string; basePath: false }> = [];

    // Proxy Framer pages from uxtra.co.il (now on Framer) to weareelse.co.il
    // These must proxy to the Framer project's default domain, NOT uxtra.co.il
    // (after DNS switch, uxtra.co.il will 301 redirect here → loop prevention)
    if (FRAMER_ORIGIN) {
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
        externalRewrites.push({
          source: path,
          destination: `${FRAMER_ORIGIN}${path}`,
          basePath: false,
        });
      });

      // Proxy Framer assets (CSS, JS, images, fonts, etc.)
      externalRewrites.push(
        {
          source: "/_framer/:path*",
          destination: `${FRAMER_ORIGIN}/_framer/:path*`,
          basePath: false,
        },
        {
          source: "/framerusercontent.com/:path*",
          destination: `https://framerusercontent.com/:path*`,
          basePath: false,
        }
      );
    }

    // Proxy design-to-code workshop site
    if (DESIGN_TO_CODE_ORIGIN) {
      externalRewrites.push({
        source: "/workshops/design-to-code",
        destination: `${DESIGN_TO_CODE_ORIGIN}/workshops/design-to-code`,
        basePath: false,
      });
      externalRewrites.push({
        source: "/workshops/design-to-code/:path*",
        destination: `${DESIGN_TO_CODE_ORIGIN}/workshops/design-to-code/:path*`,
        basePath: false,
      });
    }

    return {
      beforeFiles: externalRewrites,
      afterFiles: internalRewrites,
    };
  },
  async redirects() {
    // the bare domain forwards to the course page (until weareelse.co.il has a home of its own)
    return [{ source: "/", destination: BASE_PATH, basePath: false, permanent: false }];
  },
};

export default nextConfig;
