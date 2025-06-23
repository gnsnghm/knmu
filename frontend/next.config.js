// frontend/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://backend:3000/:path*",
      },
    ];
  },
};

export default nextConfig;
