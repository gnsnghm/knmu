/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "item-shopping.c.yimg.jp",
        port: "",
        pathname: "/i/g/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          process.env.BACKEND_INTERNAL_URL?.replace(/\/?$/, "/:path*") ||
          "http://backend:3000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
