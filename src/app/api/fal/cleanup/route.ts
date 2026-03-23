// src/app/api/fal/cleanup/route.ts

import { NextRequest, NextResponse } from 'next/server';
import * as fs from "fs/promises";
import * as path from "path";

const uploadPath = process.env.UPLOAD_PATH || '';

export async function POST(
    request: NextRequest) {

    try {
        const input: Record<string, string> = await request.json();

        await cleanup(input);

        return NextResponse.json({ ok: true });
    } catch (error) {
        let message = '알 수 없는 오류';

        if (error instanceof Error) {
            message = error.message;
        }

        // FAL AI 구조화 에러 처리 (`body.detail`)
        if (typeof error === 'object' && error !== null && 'body' in error) {
            const body = (error as { body?: { detail?: string } }).body;
            if (body?.detail) {
                message = body.detail;
            }
        }

        return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
}

async function cleanup(input: Record<string, unknown>): Promise<void> {
    for (const name in input) {
        const value = input[name];

        if (typeof value === "string" && value.includes("amazonaws.com")) {

            // do nothing for S3 URLs

        } else if (typeof value === "string") {
            const filename = path.basename(value);
            const inputFilePath = path.join(uploadPath, filename);

            await fs.access(inputFilePath);
            await fs.unlink(inputFilePath);
        }
    }
}
