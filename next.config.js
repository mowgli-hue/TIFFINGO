/** @type {import('next').NextConfig} */

/* Two builds from one codebase.

   The default build is the Next.js server on Vercel — API routes, role
   guards, everything.

   MOBILE_BUILD=1 produces a static export that gets bundled INSIDE the
   iOS and Android binaries. It contains only the customer screens; the
   API routes and staff dashboards are moved aside by scripts/build-mobile.mjs
   and every request goes to NEXT_PUBLIC_API_BASE over the network. */
const isMobile = process.env.MOBILE_BUILD === '1';

const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
    ...(isMobile ? { unoptimized: true } : {}),
  },
  ...(isMobile
    ? {
        output: 'export',
        distDir: '.next-mobile',
        trailingSlash: true,
      }
    : {}),
};

module.exports = nextConfig;
