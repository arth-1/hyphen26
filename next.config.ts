import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Prevent the updated_ui folder from being accessible as a route
  async redirects() {
    return [
      // Make / point to the new UI route
      {
        source: '/',
        destination: '/home',
        permanent: false,
      },
      // Prevent the updated_ui folder from being accessible as a route
      {
        source: '/updated_ui/:path*',
        destination: '/404',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
