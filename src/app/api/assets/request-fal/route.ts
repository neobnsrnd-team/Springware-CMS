// src/app/api/assets/request-fal/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { fal } from "@fal-ai/client";

const FAL_API_KEY = process.env.FAL_API_KEY;

export async function POST(req: NextRequest) {

    const falApiKey = FAL_API_KEY;
    if (!falApiKey) return NextResponse.json({ error: 'FAL API 키를 찾을 수 없습니다.' }, { status: 403 });

    fal.config({
        credentials: falApiKey
    });

    const { model, payload } = await req.json();

    try {

        const input = payload;

        const { request_id }: { request_id: string } = await fal.queue.submit(model, { 
            input 
        });

        return NextResponse.json({ ok: true, request_id }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { ok: false, error: error instanceof Error ? error.message : '알 수 없는 오류' },
            { status: 500 }
        );
    }
}
