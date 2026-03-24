import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 이미지 최적화: 외부 도메인 허용 (Supabase Storage 등)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  // Vercel 배포 시 standalone 모드 불필요 (Vercel이 자동 처리)
  // PWA 관련 헤더
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
