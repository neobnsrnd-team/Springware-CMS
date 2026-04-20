// ============================================================================
// FWK_BATCH_HIS — 배치 실행 이력 SQL 맵퍼
// spider-admin 프레임워크 테이블 — 배치 실행 결과 기록용
// ============================================================================

/** 배치 실행 이력 INSERT — 배치 시작 시 등록 (RES_RT_CODE: '0' = 시작) */
export const BATCH_HIS_INSERT = `
  INSERT INTO FWK_BATCH_HIS (
    BATCH_APP_ID,
    BATCH_DATE,
    EXEC_USER_ID,
    RES_RT_CODE,
    START_DTIME
  ) VALUES (
    :batchAppId,
    :batchDate,
    :userId,
    :resRtCode,
    SYSTIMESTAMP
  )
`;

/** 배치 실행 이력 UPDATE — 배치 완료/실패 시 결과 갱신
 *  RES_RT_CODE: '1' = 성공, '9' = 비정상 종료
 */
export const BATCH_HIS_UPDATE = `
  UPDATE FWK_BATCH_HIS
  SET RES_RT_CODE = :resRtCode,
      END_DTIME   = SYSTIMESTAMP
  WHERE BATCH_APP_ID = :batchAppId
    AND BATCH_DATE   = :batchDate
`;
