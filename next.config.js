/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["leaflet", "react-leaflet"],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "lundingolfclub.co.uk" },
      { protocol: "https", hostname: "images.squarespace-cdn.com" },
      { protocol: "https", hostname: "www.leven-links.com" },
      { protocol: "https", hostname: "clubv1.blob.core.windows.net" },
      { protocol: "https", hostname: "www.dumbarnielinks.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
};

module.exports = nextConfig;
