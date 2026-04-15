import type { NextConfig } from 'next';

const cmsBasePath = process.env.NEXT_PUBLIC_CMS_BASE_PATH ?? '/cms';

const nextConfig: NextConfig = {
    ...(cmsBasePath
        ? {
              basePath: cmsBasePath,
              assetPrefix: cmsBasePath,
          }
        : {}),
    // oracledb native 모듈을 번들링하지 않고 외부에서 로드 (Thick 모드 지원)
    serverExternalPackages: ['oracledb'],
    // Docker 배포용 standalone 빌드 — .next/standalone/server.js 생성
    output: 'standalone',
};

export default nextConfig;
