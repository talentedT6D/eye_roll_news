/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.thehindu.com" },
      { protocol: "https", hostname: "**.indianexpress.com" },
      { protocol: "https", hostname: "**.scroll.in" },
      { protocol: "https", hostname: "**.theprint.in" },
      { protocol: "https", hostname: "**.livemint.com" },
      { protocol: "https", hostname: "**.ndtv.com" },
      { protocol: "https", hostname: "**.ndtvimg.com" },
      { protocol: "https", hostname: "**.gumlet.io" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
