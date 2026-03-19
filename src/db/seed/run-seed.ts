// ============================================================================
// 시드 실행 진입점 — npx tsx src/db/seed/run-seed.ts
// ============================================================================

// .env 파일 로드 (Next.js 외부 실행이므로 수동 로드 필요)
import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { seedFinanceComponents } from './seed-components';
import { seedBasicBlocks } from './seed-basic-blocks';
import { closePool } from '@/db/connection';

async function main() {
    console.log('='.repeat(60));
    console.log('컴포넌트 데이터 시드 시작');
    console.log('='.repeat(60));

    // 1. 금융 컴포넌트 시드
    console.log('\n── 금융 컴포넌트 시드 ──');
    const finance = await seedFinanceComponents();
    console.log(`\n금융 컴포넌트: ${finance.inserted}건 INSERT, ${finance.skipped}건 건너뜀`);

    // 2. 기본 블록 시드
    console.log('\n── 기본 블록 시드 ──');
    const basic = await seedBasicBlocks();
    console.log(`\n기본 블록: ${basic.inserted}건 INSERT, ${basic.skipped}건 건너뜀`);

    // 결과 요약
    const totalInserted = finance.inserted + basic.inserted;
    const totalSkipped = finance.skipped + basic.skipped;
    console.log('\n' + '='.repeat(60));
    console.log(`시드 완료 — 총 ${totalInserted}건 INSERT, ${totalSkipped}건 건너뜀`);
    console.log('='.repeat(60));

    await closePool();
}

main().catch(async (err) => {
    console.error('시드 실패:', err);
    await closePool();
    process.exit(1);
});
