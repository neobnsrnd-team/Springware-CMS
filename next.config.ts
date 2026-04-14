import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/cms',
  assetPrefix: '/cms',
  // oracledb native 모듈을 번들링하지 않고 외부에서 로드 (Thick 모드 지원)
  serverExternalPackages: ['oracledb'],
  // Docker 배포용 standalone 빌드 — .next/standalone/server.js 생성
  output: 'standalone',
};

export default nextConfig;

