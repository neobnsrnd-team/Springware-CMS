// src/app/api/builder/upload/route.ts

import path from 'path';
import { writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {

    // 데모용: 업로드 파일을 public 폴더에 저장
    // 프로덕션에서는 S3 등 외부 스토리지로 교체 권장

    const uploadPath = process.env.UPLOAD_PATH;   // 실제 저장 경로 (예: "/public/uploads/")
    const uploadUrl = process.env.UPLOAD_URL;     // URL 기본 경로 (예: "/uploads/")

    if (!uploadPath || !uploadUrl) {
        return NextResponse.json(
            { ok: false, error: 'UPLOAD_PATH 또는 UPLOAD_URL이 설정되지 않았습니다.' },
            { status: 500 }
        );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
        return NextResponse.json(
            { ok: false, error: '파일이 없습니다.' },
            { status: 400 }
        );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

    try {
        await writeFile(
            path.join(process.cwd(), uploadPath, filename),
            buffer
        );

        return NextResponse.json(
            { ok: true, url: path.join(uploadUrl, filename) },
            { status: 201 }
        );
    } catch (error) {
        console.error('파일 업로드 실패:', error);
        return NextResponse.json(
            { ok: false, error: '파일 저장 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
