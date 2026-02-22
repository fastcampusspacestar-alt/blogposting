import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1,000개 이상의 포스팅 정적 생성 타임아웃 방지
  experimental: {
    // 정적 생성 타임아웃 (초)
  },
  // 이미지 최적화
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
