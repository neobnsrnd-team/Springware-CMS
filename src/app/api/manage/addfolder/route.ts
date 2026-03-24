// src/app/api/manage/addfolder/route.ts
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

import { UPLOAD_PATH, UPLOAD_URL } from '@/lib/upload';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, path: relativePath = '' } = body;

        // 입력 검증
        if (!name || typeof name !== 'string') {
            return Response.json({ error: '폴더 이름을 입력해주세요.' }, { status: 400 });
        }

        // 앞뒤 공백 제거
        const sanitizedName = name.trim();
        if (!sanitizedName) {
            return Response.json({ error: '폴더 이름은 비워둘 수 없습니다.' }, { status: 400 });
        }

        // 위험한 이름 차단
        if (
            sanitizedName.includes('/') ||
            sanitizedName.includes('\\') ||
            sanitizedName === '..' ||
            sanitizedName === '.'
        ) {
            return Response.json({ error: '유효하지 않은 폴더 이름입니다.' }, { status: 400 });
        }

        // 보안: 디렉토리 트래버설 방지
        if (relativePath.includes('..')) {
            return Response.json({ error: '유효하지 않은 경로입니다.' }, { status: 400 });
        }

        const absoluteBasePath = path.join(process.cwd(), UPLOAD_PATH);
        const absoluteFolderPath = path.join(absoluteBasePath, relativePath, sanitizedName);

        // uploads 디렉토리 범위 이탈 방지
        if (!absoluteFolderPath.startsWith(absoluteBasePath)) {
            return Response.json({ error: '유효하지 않은 경로입니다.' }, { status: 400 });
        }

        // 동일한 폴더 존재 여부 확인
        if (fs.existsSync(absoluteFolderPath)) {
            return Response.json({ error: '이미 존재하는 폴더입니다.' }, { status: 409 });
        }

        // 디렉토리 생성 (하위 경로 포함)
        fs.mkdirSync(absoluteFolderPath, { recursive: true });

        return Response.json({
            ok: true,
            folder: {
                name: sanitizedName,
                url: `${UPLOAD_URL}${relativePath ? `${relativePath}/${sanitizedName}` : sanitizedName}`,
                isDirectory: true,
                size: 0,
            },
        });
    } catch (error) {
        console.error('폴더 생성 오류:', error);
        return Response.json({ error: '폴더 생성에 실패했습니다.' }, { status: 500 });
    }
}
