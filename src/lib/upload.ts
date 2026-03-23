// src/lib/upload.ts

import { normalizeUploadUrl } from './upload-utils';
import { UPLOAD_PATH_ENV, UPLOAD_URL_ENV } from './env';

export { normalizeUploadUrl };

/** 파일 실제 저장 경로 (기본: public/uploads/) */
export const UPLOAD_PATH = UPLOAD_PATH_ENV;

/** 업로드 파일 URL 기본 경로 — 슬래시 정규화 적용 (기본: /uploads/) */
export const UPLOAD_URL = normalizeUploadUrl(UPLOAD_URL_ENV);
