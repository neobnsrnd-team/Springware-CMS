// src/lib/upload.ts

import { normalizeUploadUrl } from './upload-utils';

export { normalizeUploadUrl };

/** 파일 실제 저장 경로 (기본: public/uploads/) */
export const UPLOAD_PATH = process.env.UPLOAD_PATH || 'public/uploads/';

/** 업로드 파일 URL 기본 경로 — 슬래시 정규화 적용 (기본: /uploads/) */
export const UPLOAD_URL = normalizeUploadUrl(process.env.UPLOAD_URL || 'uploads/');
