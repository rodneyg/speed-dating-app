import type { NextConfig } from "next";
// @ts-ignore
import withPWA from "next-pwa";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // Add any Next.js configuration here
};

// Apply PWA only in production
const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: isDev, // Disable PWA in development mode
  runtimeCaching: [
    {
      urlPattern: /^\/api\/get-feed/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "api-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /\.(?:js|css|png|jpg|jpeg|svg|gif)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "static-resources",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },
  ],
});

export default pwaConfig(nextConfig);