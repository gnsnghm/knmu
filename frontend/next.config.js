/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
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
