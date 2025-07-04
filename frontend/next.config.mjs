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
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN,
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: `${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`,
        port: "",
        pathname: "/**",
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
