import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // oracledb native 모듈을 번들링하지 않고 외부에서 로드 (Thick 모드 지원)
  serverExternalPackages: ['oracledb'],
};

export default nextConfig;
