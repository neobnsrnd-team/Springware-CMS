// src/app/api/assets/status-fal/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { fal } from "@fal-ai/client";

const FAL_API_KEY = process.env.FAL_API_KEY;

interface PostRequestBody {
    request_id: string;
    model: string;
    customData?: unknown;
}

export async function POST(
    req: NextRequest) {

    const falApiKey = FAL_API_KEY;
    if (!falApiKey) return NextResponse.json({ error: 'FAL API 키를 찾을 수 없습니다.' }, { status: 403 });

    // Configure FAL client with the dynamic key
    fal.config({
        credentials: falApiKey
    });
    
    const { request_id, model }: PostRequestBody = await req.json();

    try {

        const result = await fal.queue.status(model, {
            requestId: request_id,
            logs: true,
        });

        return NextResponse.json({ ok: true, result, status: result.status });
    } catch (err: unknown) {
        let message = "Unknown error";

        if (err instanceof Error) {
            message = err.message;
        }

        // throw structured errors with `body.detail`
        if (typeof err === "object" && err !== null && "body" in err) {
            const body = (err as { body?: { detail?: string } }).body;
            if (body?.detail) {
                message = body.detail;
            }
        }

        return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }

}
