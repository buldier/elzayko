import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/** Origins needed when STORAGE_DRIVER=s3 (public CDN for derivatives, bucket endpoint for signed URLs). */
function storageOrigins(): string[] {
  const origins = new Set<string>();
  for (const value of [process.env.S3_PUBLIC_BASE_URL, process.env.S3_ENDPOINT]) {
    if (value) origins.add(new URL(value).origin);
  }
  if (process.env.S3_BUCKET && process.env.S3_REGION && !process.env.S3_ENDPOINT) {
    origins.add(`https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com`);
  }
  return [...origins];
}

const storage = storageOrigins().join(" ");

const contentSecurityPolicy = [
  "default-src 'self'",
  // Next.js injects inline bootstrap scripts; nonces would force every page to render dynamically.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://i.ytimg.com ${storage}`,
  `media-src 'self' blob: ${storage}`,
  "frame-src https://www.youtube-nocookie.com",
  `connect-src 'self' ${storage}`,
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  isDev ? "" : "upgrade-insecure-requests",
]
  .filter(Boolean)
  .join("; ");

const publicBase = process.env.S3_PUBLIC_BASE_URL ? new URL(process.env.S3_PUBLIC_BASE_URL) : null;

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    localPatterns: [
      { pathname: "/files/derivatives/**", search: "" },
      // Decorative theme artwork (glows, soundwave, 404 art) shipped in /public.
      { pathname: "/musfix/**", search: "" },
    ],
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
      ...(publicBase
        ? [
            {
              protocol: publicBase.protocol.replace(":", "") as "https" | "http",
              hostname: publicBase.hostname,
              pathname: `${publicBase.pathname.replace(/\/$/, "")}/derivatives/**`,
            },
          ]
        : []),
    ],
    qualities: [70, 80],
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
