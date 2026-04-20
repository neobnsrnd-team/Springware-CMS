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
    serverExternalPackages: ['oracledb', 'node-cron'],
    // Docker 배포용 standalone 빌드 — .next/standalone/server.js 생성
    output: 'standalone',
    // instrumentation.ts가 edge 번들로 컴파일될 때 fs/promises 등 Node.js 내장 모듈 해석 실패 방지
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...(config.resolve.fallback || {}),
                fs: false,
                'fs/promises': false,
                path: false,
                crypto: false,
            };
        }
        return config;
    },
};

export default nextConfig;
