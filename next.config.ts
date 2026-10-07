import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.supabase.co";

const nextConfig: NextConfig = {
  images: {
    // Only public showcase photos. Certificates never go through next/image.
    remotePatterns: [new URL(`${supabaseUrl}/storage/v1/object/public/photos/**`)],
  },
};

export default nextConfig;
