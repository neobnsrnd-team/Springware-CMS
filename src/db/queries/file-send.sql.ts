// ============================================================================
// FWK_CMS_FILE_SEND_HIS — 파일 전송 이력 SQL 맵퍼 (AS-IS 참조)
// ============================================================================

/** 파일 전송 이력 단건 조회 */
export const FILE_SEND_SELECT_BY_ID = `
  SELECT *
  FROM FWK_CMS_FILE_SEND_HIS
  WHERE INSTANCE_ID = :instanceId
    AND FILE_ID = :fileId
`;

/** 파일 전송 이력 등록 */
export const FILE_SEND_INSERT = `
  INSERT INTO FWK_CMS_FILE_SEND_HIS (
    INSTANCE_ID, FILE_ID, FILE_SIZE, FILE_CRC_VALUE, LAST_MODIFIER_ID
  ) VALUES (
    :instanceId, :fileId, :fileSize, :fileCrcValue, :lastModifierId
  )
`;

/** 인스턴스별 전송 이력 목록 */
export const FILE_SEND_SELECT_BY_INSTANCE = `
  SELECT *
  FROM FWK_CMS_FILE_SEND_HIS
  WHERE INSTANCE_ID = :instanceId
  ORDER BY LAST_MODIFIED_DTIME DESC
`;
