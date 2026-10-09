import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.supabase.co";

const nextConfig: NextConfig = {
  // Development only: lets a phone on the same Wi-Fi open the dev server by the Mac's
  // home-network address (e.g. http://192.168.0.5:8801) with scripts working.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
  images: {
    // Only public showcase photos. Certificates never go through next/image.
    remotePatterns: [new URL(`${supabaseUrl}/storage/v1/object/public/photos/**`)],
  },
};

export default nextConfig;
