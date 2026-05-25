const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

module.exports = nextConfig;



// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         // Supabase Storage — covers all project buckets
//         protocol: "https",
//         hostname: "*.supabase.co",
//         pathname: "/storage/v1/object/public/**",
//       },
//       {
//         // Supabase CDN (some projects use this hostname)
//         protocol: "https",
//         hostname: "*.supabase.in",
//         pathname: "/storage/v1/object/public/**",
//       },
//     ],
//   },
// };

// export default nextConfig;
