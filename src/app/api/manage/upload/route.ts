// src/app/api/manage/upload/route.ts
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

import { normalizeUploadUrl } from '@/lib/upload-utils';

const UPLOAD_PATH = process.env.UPLOAD_PATH || 'public/uploads/';
const UPLOAD_URL = normalizeUploadUrl(process.env.UPLOAD_URL || 'uploads/');
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const targetPath = (formData.get('path') as string) || '';

        if (!file) {
            return Response.json({ error: '파일이 없습니다.' }, { status: 400 });
        }

        // 보안: 디렉토리 트래버설 방지
        if (targetPath.includes('..')) {
            return Response.json({ error: '유효하지 않은 경로입니다.' }, { status: 400 });
        }

        // 파일 크기 검증
        if (file.size > MAX_FILE_SIZE) {
            return Response.json(
                {
                    error: `파일 크기가 초과되었습니다. 최대 ${MAX_FILE_SIZE / 1024 / 1024}MB까지 업로드 가능합니다.`,
                },
                { status: 400 },
            );
        }

        // 파일명 새니타이징 (특수문자 → _)
        const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

        // 업로드 경로 구성
        const uploadDir = path.join(process.cwd(), UPLOAD_PATH, targetPath);
        const filePath = path.join(uploadDir, filename);

        // 디렉토리가 없으면 생성
        if (!fs.existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // 동일한 파일 존재 여부 확인
        if (fs.existsSync(filePath)) {
            return Response.json(
                {
                    error: '이미 존재하는 파일입니다.',
                },
                { status: 409 },
            );
        }

        // 파일 버퍼 변환 후 저장
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        const urlPath = targetPath ? `${targetPath}/${filename}` : filename;

        return Response.json({
            ok: true,
            file: {
                name: filename,
                url: `${UPLOAD_URL}${urlPath}`,
                size: file.size,
            },
        });
    } catch (error) {
        console.error('업로드 오류:', error);
        return Response.json({ error: '파일 업로드에 실패했습니다.' }, { status: 500 });
    }
}
