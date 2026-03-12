// src/app/api/builder/load/route.ts

import { NextRequest, NextResponse } from "next/server";
import fsPromises from "fs/promises";

const VALID_BANKS = ['ibk', 'hana', 'kb', 'shinhan', 'woori', 'nh'];

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const bank = VALID_BANKS.includes(body.bank) ? body.bank : 'ibk';
        const filePath = `data/${bank}.json`;

        try {
            const fileContent = await fsPromises.readFile(filePath, { encoding: "utf8" });
            const pageData = JSON.parse(fileContent);
            return NextResponse.json({
                ok: true,
                html: pageData.content,
                updated: pageData.updated,
            });
        } catch {
            // 파일 없으면 빈 콘텐츠 반환 (첫 방문)
            return NextResponse.json({ ok: true, html: '', updated: null });
        }
    } catch (error) {
        console.error("Load error:", error);
        return NextResponse.json({ error: "Failed to load page." }, { status: 500 });
    }
}