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
    // basePath('/cms') 없이 접근하는 외부 시스템(spider-admin 배치 실행) 경로 우회
    async rewrites() {
        return [{ source: '/api/batch/execute', destination: '/cms/api/batch/execute' }];
    },
    webpack(config, { nextRuntime }) {
        // edge 런타임 빌드 시 Node.js 내장 모듈(fs, path 등) 번들 오류 방지
        // instrumentation.ts → scheduler.ts → page.repository.ts 체인이 edge용으로 컴파일될 때
        // fs/promises 등을 resolve하지 못하는 문제를 fallback: false 로 해결
        // (실제 edge 실행은 register() 상단 NEXT_RUNTIME 가드로 차단)
        if (nextRuntime === 'edge') {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                'fs/promises': false,
                fs: false,
                path: false,
            };
        }
        return config;
    },
};

export default nextConfig;
