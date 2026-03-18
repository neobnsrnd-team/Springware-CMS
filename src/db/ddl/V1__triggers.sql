-- ============================================================================
-- Springware CMS — Oracle 19c 트리거 스크립트
-- ============================================================================
-- 이슈 #26 ERD v5 기준 | 트리거 4개
--   - TRIGGER 1~3: LAST_MODIFIED_DTIME 자동 갱신 (UPDATE 시)
--   - TRIGGER 4  : SPW_CMS_COMP_PAGE_MAP.SEQ 자동 채번 (INSERT 시)
-- 생성일: 2026-03-18
--
-- ※ DBeaver 실행 방법:
--    /부분 제외하고 create부터 ;까지 별개로 하나씩 실행해주세요.
-- ============================================================================


-- 1. 시퀀스 생성 (이미 있으면 에러 나도 무시하고 다음으로 진행하세요)
CREATE SEQUENCE SPW_COMP_MAP_SEQ START WITH 1 INCREMENT BY 1;

-- 2. COMPONENT 트리거
CREATE OR REPLACE TRIGGER TRG_SPW_COMPONENT_MOD_DTIME
BEFORE UPDATE ON SPW_CMS_COMPONENT
                  FOR EACH ROW
BEGIN
    :NEW.LAST_MODIFIED_DTIME := SYSTIMESTAMP;
END;
/

-- 3. PAGE 트리거
CREATE OR REPLACE TRIGGER TRG_SPW_PAGE_MOD_DTIME
BEFORE UPDATE ON SPW_CMS_PAGE
                  FOR EACH ROW
BEGIN
    :NEW.LAST_MODIFIED_DTIME := SYSTIMESTAMP;
END;
/

-- 4. MAP 수정일 트리거
CREATE OR REPLACE TRIGGER TRG_SPW_COMP_MAP_MOD_DTIME
BEFORE UPDATE ON SPW_CMS_COMP_PAGE_MAP
                  FOR EACH ROW
BEGIN
    :NEW.LAST_MODIFIED_DTIME := SYSTIMESTAMP;
END;
/

-- 5. MAP 시퀀스 채번 트리거
CREATE OR REPLACE TRIGGER TRG_SPW_COMP_MAP_SEQ
BEFORE INSERT ON SPW_CMS_COMP_PAGE_MAP
FOR EACH ROW
BEGIN
    IF :NEW.SEQ IS NULL THEN
SELECT SPW_COMP_MAP_SEQ.NEXTVAL INTO :NEW.SEQ FROM DUAL;
END IF;
END;
/


-- ════════════════════════════════════════════════════════════════════════════
-- [검증] 트리거 생성 확인 —
-- ════════════════════════════════════════════════════════════════════════════
SELECT trigger_name, table_name, status
FROM user_triggers
WHERE table_name LIKE 'SPW_CMS_%'
ORDER BY table_name;
