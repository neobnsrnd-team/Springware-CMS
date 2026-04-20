// ============================================================================
// FWK_BATCH_HIS — 배치 이력 Repository
// spider-admin 프레임워크 테이블에 배치 실행 결과를 기록
// ============================================================================

import { getConnection } from '@/db/connection';
import { BATCH_HIS_INSERT, BATCH_HIS_UPDATE } from '@/db/queries/batch.sql';

export type BatchResRtCode =
    | '0' // 시작
    | '1' // 성공
    | '9'; // 비정상 종료

/** 배치 실행 이력 등록 — 배치 시작 시 호출 */
export async function insertBatchHis(params: {
    batchAppId: string;
    batchDate: string;
    userId: string;
    resRtCode: BatchResRtCode;
}): Promise<void> {
    const conn = await getConnection();
    try {
        await conn.execute(BATCH_HIS_INSERT, params, { autoCommit: true });
    } finally {
        await conn.close();
    }
}

/** 배치 실행 이력 갱신 — 배치 완료/실패 시 호출 */
export async function updateBatchHis(params: {
    batchAppId: string;
    batchDate: string;
    resRtCode: BatchResRtCode;
}): Promise<void> {
    const conn = await getConnection();
    try {
        await conn.execute(BATCH_HIS_UPDATE, params, { autoCommit: true });
    } finally {
        await conn.close();
    }
}
